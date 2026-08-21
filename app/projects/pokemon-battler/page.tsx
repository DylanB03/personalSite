import type { Metadata } from "next"
import Link from "next/link"
import { PolicyDiagram } from "@/components/policy-diagram"
import { SiteShell } from "@/components/site-shell"

export const metadata: Metadata = {
  title: "Training a 0.5B Pokémon model to win on the ranked ladder — Dylan Butz",
  description:
    "How I rebuilt the training objective, battle-state representation, and dataset before a 0.5B model finished 1,000 public ranked games with a positive record.",
}

export default function PokemonBattlerArticle() {
  return (
    <SiteShell active="projects" article>
      <article className="project-article">
        <Link className="back-link" href="/projects">
          <span aria-hidden="true">←</span> back
        </Link>

        <header className="article-header">
          <div>
            <p className="eyebrow">Project / Pokémon Battler</p>
            <h1>Training a 0.5B Pokémon model to win on the ranked ladder</h1>
          </div>
          <div className="article-dateline">
            <span>Generation 9 OU</span>
            <time dateTime="2026-08-18">August 2026</time>
          </div>
        </header>

        <p className="article-lede">
          I started by fine-tuning Qwen to write two-character action IDs. I finished with a system that combined
          Qwen with a smaller network built to compare Pokémon mechanics. It played 1,000 public Pokémon Showdown
          games with a positive win rate.
        </p>

        <section className="result-panel" aria-labelledby="result-heading">
          <div className="result-panel-copy">
            <p className="eyebrow" id="result-heading">Final public result</p>
            <p className="result-record">502–498</p>
            <p>
              One unchanged model, one fixed team, and 30,385 decisions. No learning or search ran between games.
            </p>
          </div>
          <dl className="result-stats">
            <div><dt>Win rate</dt><dd>50.2%</dd></div>
            <div><dt>95% interval</dt><dd>47.1–53.3%</dd></div>
            <div><dt>Fallbacks</dt><dd>0</dd></div>
            <div><dt>Final account ELO</dt><dd>1189*</dd></div>
          </dl>
          <p className="result-note">
            *The account started at 1000, but its rating also includes earlier policies, cancelled runs, and
            disconnect losses. The clean measurement is the 502–498 record.
          </p>
        </section>

        <section>
          <h2>The actual problem</h2>
          <p>
            My target was a Generation 9 OU battle policy, meaning a model that chooses an action each turn, built around{" "}
            <a href="https://huggingface.co/Qwen/Qwen2.5-0.5B">Qwen2.5-0.5B</a>. Given the public state of a
            battle, it had to rank the legal moves, switches, and Terastallized moves. I kept the model small
            because it fit on my 8 GB GPU. I stored its existing weights at 4-bit precision and trained only small
            LoRA adapter layers instead of updating every weight. A larger model would have made every experiment
            slower before I knew whether the rest of the training setup worked.
          </p>
          <p>The action space looks simple. Each turn has at most thirteen choices:</p>
          <ul>
            <li><code>A0–A3</code>: ordinary moves</li>
            <li><code>A4–A8</code>: available switches</li>
            <li><code>A9–A12</code>: the four moves with Terastallization enabled</li>
          </ul>
          <p>
            Those IDs are positional. <code>A4</code> can mean switching to Corviknight in one position and Great
            Tusk in another. The <code>A4</code> label has no fixed meaning for the model to memorize. It has to
            compare the current battle with the choices available on that turn.
          </p>
          <p>The first answer from the untrained base model followed a confident-looking format and was completely useless:</p>
          <pre><code>{`<legal_actions_counts>
  <A0>0</A0>
  <A1>0</A1>
  <A2>0</A2>
</legal_actions_counts>`}</code></pre>
          <p>
            That response became a theme. The model could learn the format of a decision much sooner than it
            could learn the decision itself.
          </p>
        </section>

        <section>
          <h2>The first loss was measuring spelling</h2>
          <p>
            My original training setup treated an action as text. Qwen generated a string such as <code>A4</code>,
            followed by the token that marks the end of an answer. The training loss fell to about 0.6, yet the
            model chose the same action as the recorded player only 29% of the time.
          </p>
          <p>
            Tokenization explained the mismatch. <code>A4</code> becomes the repeated token <code>A</code>, one
            decision-bearing digit, and the end marker. The easy <code>A</code> and end tokens pulled the average
            down. I had optimized the model to spell the answer template, then read that loss as though it measured
            battle decisions.
          </p>
          <table>
            <thead><tr><th>Original run</th><th>Train loss</th><th>Exact agreement</th><th>Switch agreement</th></tr></thead>
            <tbody>
              <tr><td><code>1e-4</code></td><td>0.594</td><td>29.4%</td><td>18.9%</td></tr>
              <tr><td><code>2e-4</code></td><td>0.591</td><td>29.0%</td><td>15.3%</td></tr>
            </tbody>
          </table>
          <p>
            The nearly identical curves also ruled out the answer I kept reaching for: another small learning-rate
            change. The objective itself was wrong.
          </p>
          <p>
            I stopped training Qwen to write an answer. Instead, it assigned one score to every legal action, and
            cross-entropy trained the recorded action to outrank the rest. If <code>s(a)</code> is the score for a
            legal action, the loss is:
          </p>
          <div className="equation" role="img" aria-label="Negative log likelihood of the target score over all legal action scores">
            L = −log [ exp s(a<sub>target</sub>) / Σ<sub>a ∈ legal</sub> exp s(a) ]
          </div>
          <p>
            This made the displayed loss rise to roughly 1.8 early in training. That looked worse, but it was the
            first honest number because each training example now measured one complete decision. If the model gave
            every legal action the same score, its loss would average 2.127. A loss of 1.8 was better than guessing,
            though nowhere near good enough.
          </p>
        </section>

        <aside className="pull-quote"><p>A legal-action filter can prevent nonsense. It cannot choose the best legal move.</p></aside>

        <section>
          <h2>Legality and quality are different metrics</h2>
          <p>
            Pokémon Showdown supplies the exact legal choices for a live turn. Before selecting an action, I remove
            every illegal choice from the model&apos;s scores. The bot therefore cannot choose an illegal move.
          </p>
          <p>
            It says nothing about whether the model should use Earthquake, preserve a win condition, switch out of
            a bad matchup, or spend Tera. My early “100% legal-action rate” was an implementation property, not a
            model result. Once I separated those ideas, I stopped using legality as evidence that the model had
            learned anything.
          </p>
          <p>
            The direct action-ranking version matched the recorded action on 36.52% of a fixed 1,024-position
            validation sample. This measured the complete decision, not an easier test that tells the model whether
            to move or switch before asking it to choose which one. The gain was real, but both training loss and
            validation accuracy flattened halfway through the first pass over the dataset.
          </p>
        </section>

        <section>
          <h2>I cut prose and added mechanics</h2>
          <p>
            The first state format repeated XML tags, field names, and default values. Its median length was 2,057
            tokens. A compact format brought that down to 1,157 tokens, a 44% reduction. I could avoid calculating
            scores for most words in Qwen&apos;s vocabulary, but Qwen still had to process every prompt token through
            the full network. Shorter battle states directly reduced training and inference work.
          </p>
          <p>
            The shorter prompt was cheaper to process, but the 0.5B model was still being asked to infer database
            facts from move names. A name stands for type, power, priority, accuracy, status chance, recoil,
            healing, stat changes, hazard effects, and dozens of special cases.
          </p>
          <p>
            I built a fixed-size numeric row for every possible action. It included type effectiveness, same-type
            attack bonus, expected damage, priority, remaining uses, status probabilities, stat changes, healing,
            recoil, hazards, health after switching in, and matchup pressure. The first version described each
            action with 97 numbers and cut the remaining text prompt to about 466 tokens.
          </p>
          <p>
            Then I measured collisions. In 2,880 rows, at least two legal actions had identical 97-value vectors.
            The recorded action sat inside one of those tied groups 780 times. Rest and Sleep Talk could look the
            same. So could Reflect and Light Screen, or Spikes and Stealth Rock. If two actions have identical
            inputs, the network has no information it can use to rank one above the other.
          </p>
          <p>
            I expanded the representation to 207 numeric mechanics values plus 32 identity fields for moves,
            species, items, abilities, types, statuses, field effects, and recent events. The network turns each
            identity into a small learned vector. Numbers let it recognize similar situations, while identities
            keep Rest distinct from Sleep Talk and Spikes distinct from Stealth Rock.
          </p>
          <div className="comparison-bars" role="img" aria-label="Exact action agreement improved from 36.52 percent to 41.89 percent on the fixed validation sample">
            <div className="comparison-row">
              <div className="comparison-label"><span>Direct action ranking</span><span>36.52%</span></div>
              <div className="comparison-track"><span style={{ width: "73.04%" }} /></div>
            </div>
            <div className="comparison-row">
              <div className="comparison-label"><span>Numbers + identities</span><span>41.89%</span></div>
              <div className="comparison-track"><span style={{ width: "83.78%" }} /></div>
            </div>
            <p>Exact agreement on the same fixed 1,024 validation rows.</p>
          </div>
          <p>
            Over 5,000 validation positions, the recorded action was the model&apos;s first choice 42.86% of the time,
            inside its top two 64.78% of the time, and inside its top three 78.78% of the time. Changing the input
            representation added more than five points on the fixed comparison without changing Qwen.
          </p>
        </section>

        <section>
          <h2>The model that actually played</h2>
          <p>
            The final bot uses two neural networks. Qwen reads the compact text description and scores every legal
            action. A smaller network scores the same actions from the numeric mechanics, move and Pokémon
            identities, both team rosters, and the last four visible turns. I combine the two rankings and play the
            legal action with the highest final score.
          </p>
          <PolicyDiagram />
          <p>
            Qwen remains part of every live decision. The smaller network handles comparisons that fit numeric data
            better, such as expected damage, matchup quality, and recent changes to the field. Pokémon Showdown only
            tells the bot which actions are legal. It does not recommend a move, and the deployed bot does not run
            a search engine or consult a hand-written battle strategy.
          </p>
        </section>

        <section>
          <h2>Better training metrics did not mean more wins</h2>
          <p>
            I tried reinforcement learning from public games too early. I used PPO, an algorithm that adjusts the
            model toward actions associated with higher rewards, across five batches and 500 rated games. The bot
            finished 178–322, or 35.6%. Each battle supplied one final win or loss across dozens of decisions. A
            loss does not identify the move that caused it, and a win does not make every earlier move correct.
          </p>
          <p>
            I also trained the model to imitate Foul Play, a stronger bot that searches possible future turns. My
            first collection contained about 51,000 decisions from 1,000 battles against only six teams. Reusing
            those positions made my model copy the teacher more closely on familiar matchups, but it did not teach
            enough new situations. A later correction network improved imitation accuracy and still tied the
            previous best model in battles it had not trained on.
          </p>
          <p>
            Training on sequences of recent turns failed the same direct battle test. Public games showed why the
            validation metrics were forgiving: after forced switches, the model attacked 88.0% of the time,
            switched 11.5%, and used Tera 0.5%. Ordinary attacks dominate recorded decisions. A model can get better
            at copying them while continuing to avoid the rarer switches and Tera choices that decide games.
          </p>
          <table>
            <thead><tr><th>Attempt</th><th>What improved</th><th>What happened in games</th></tr></thead>
            <tbody>
              <tr><td>PPO from public games</td><td>Reward on its training batches</td><td>178–322 across 500 public games</td></tr>
              <tr><td>Foul Play imitation</td><td>Agreement with the search bot</td><td>12 wins vs. the old model&apos;s 9; too few games</td></tr>
              <tr><td>Recent-turn sequence model</td><td>~44% replay agreement</td><td>20 wins vs. the old model&apos;s 21</td></tr>
              <tr><td>Teacher correction network</td><td>Closer teacher probabilities</td><td>Exact tie in unseen battles</td></tr>
            </tbody>
          </table>
          <p>
            I stopped promoting a saved model because one loss went down. A new version had to perform well on
            battle positions excluded from training, then play the previous best version against the same opponents
            and teams. Training for longer was not evidence by itself.
          </p>
        </section>

        <section>
          <h2>The model needed more kinds of battles</h2>
          <p>
            The early datasets were too small and too repetitive for the claim I wanted to make. I moved to the{" "}
            <a href="https://github.com/UT-Austin-RPL/metamon">Metamon self-play corpus</a>, which contains millions
            of complete battles and a much wider team pool. I kept both wins and losses. One part of the network
            predicted the final outcome after each recorded action. Another estimated how good the current position
            was. Moves that led to a better result than the position estimate received more weight when the model
            learned to copy them.
          </p>
          <p>
            A recorded win tells me what happened after the chosen move, not what would have happened after every
            unplayed alternative. I still preferred that incomplete signal to throwing away every loss or treating
            every move in a win as equally good.
          </p>
          <figure className="pipeline-figure">
            <div className="pipeline">
              <div><span>01</span><strong>Compressed battles</strong><small>read without unpacking</small></div><i aria-hidden="true">→</i>
              <div><span>02</span><strong>Repeatable samples</strong><small>two separate 0.5% slices</small></div><i aria-hidden="true">→</i>
              <div><span>03</span><strong>Numeric files</strong><small>convert each position once</small></div><i aria-hidden="true">→</i>
              <div><span>04</span><strong>Train both networks</strong><small>actions + final outcomes</small></div><i aria-hidden="true">→</i>
              <div><span>05</span><strong>Matched battles</strong><small>compare before deployment</small></div>
            </div>
            <figcaption>
              The pipeline rejects battles outside the chosen sample before parsing them. It saves finished batches
              separately and stores numeric features in files that training can read directly, so a stopped run does
              not need to unpack and convert the whole dataset again.
            </figcaption>
          </figure>
          <p>
            This scale forced me to rewrite preparation. I read the source archive while it remained compressed. A
            repeatable hash decided whether to keep each battle before the slower JSON parsing step. Four CPU workers
            converted the selected battles into training positions and wrote each completed batch as its own file.
            They also stored the numeric mechanics, identities, outcomes, and file locations in binary arrays that
            could be read without loading the full dataset into memory. Later training passes reused those arrays
            instead of parsing more than a million JSON rows again.
          </p>
          <p>
            The first large run kept 34,524 battles and 1,249,105 decisions. On a separate 100-game test, the new
            model finished 48–52 while the previous best version finished 30–70. That 18-game difference justified
            continuing the new model instead of replacing it.
          </p>
        </section>

        <section>
          <h2>I continued the model instead of starting over</h2>
          <p>
            The second large run used a separate 0.5% sample selected by the same repeatable rule: 34,735 battles and
            1,259,031 decisions. It continued training the first structured action scorer instead of creating a new
            one. I mixed 377,170 positions from the first run into every training pass, so one quarter of each pass
            repeated older positions while the rest came from the new sample. This reduced forgetting without
            giving up the new matchups.
          </p>
          <p>
            Validation action agreement rose from 60.94% to 62.20%, switch agreement rose from 50.36% to 52.83%,
            and loss fell from 1.5474 to 1.4964. I then tested several ways of combining Qwen&apos;s score with the
            structured network&apos;s score. The best setting added 0.75 times the structured score. On a separate
            200-game schedule, the second version finished 109–91 while the first finished 96–104.
          </p>
          <p>
            My automatic promotion rule still kept the first version. It estimated uncertainty from the matched
            games and could not rule out a tie. I left that result intact, but the second version had the best score
            across the combination tests and the stronger 200-game record, so I chose it for the public measurement.
            This was a judgment call, not a silent rewrite of the rule.
          </p>
        </section>

        <section>
          <h2>One thousand public games</h2>
          <p>
            I locked the selected model&apos;s weights and ran it on the public Generation 9 OU ladder. It always chose
            the legal action with the highest combined score, and up to four battles ran at once. The submitted team
            stayed fixed. The starting Pokémon was randomized because I had not trained the model to choose one at
            team preview.
          </p>
          <p>
            The first 100-game trace finished 53–47. That looked like the result I wanted. The next 900 finished
            449–451. The traces share no battle IDs, so I combined them instead of publishing the flattering first
            slice.
          </p>
          <table>
            <thead><tr><th>Public measurement</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td>Games</td><td>1,000</td></tr>
              <tr><td>Record</td><td>502–498</td></tr>
              <tr><td>Win rate</td><td>50.2%</td></tr>
              <tr><td>95% confidence interval</td><td>47.1–53.3%</td></tr>
              <tr><td>Model decisions</td><td>30,385</td></tr>
              <tr><td>Rule-based fallbacks</td><td>0</td></tr>
              <tr><td>Mean battle length</td><td>24.8 turns</td></tr>
            </tbody>
          </table>
          <p>
            The final margin is four games. The confidence interval includes 50%, so I cannot claim that the true
            ladder win rate is reliably above even. I can claim that one unchanged model completed 1,000 games with
            a positive record, never fell back to a hand-written move rule, and performed much better than the
            earlier 35.6% run.
          </p>
        </section>

        <section>
          <h2>What I learned</h2>
          <p>
            I spent too long treating training loss as a general measure of progress. My first loss mostly rewarded
            Qwen for producing the characters around an action ID. Scoring complete legal actions exposed how often
            it chose the wrong move. The legal-action filter was a separate software guarantee; it never belonged in
            the evidence that the model had learned to play.
          </p>
          <p>
            The input format mattered as much as the training algorithm. My first numeric format gave different
            moves identical rows, so no amount of extra training could separate them. Adding move and Pokémon
            identities fixed that mistake while keeping the useful numeric comparisons.
          </p>
          <p>
            More than a million decisions from many teams improved direct battle results. Five hundred public
            reinforcement-learning games and a narrow teacher dataset did not. Once the first large run earned a
            clear battle improvement, continuing that model with new and old positions worked better than starting
            another architecture from zero.
          </p>
          <p>
            The first 100 public games finished at 53%. If I had stopped there, I would have published the luckiest
            part of the run. Combining those games with the next 900 produced the 50.2% result on the page.
          </p>
        </section>

        <section>
          <h2>What is still missing</h2>
          <p>
            The final result uses one fixed player team, so it measures that deployed setup rather than general
            team-building ability. Team preview is random. The model sees only the last four visible turns, which is
            not enough to reconstruct every hidden move, item, ability, speed range, or Tera type. A recorded outcome
            evaluates the action that happened, not every legal alternative that could have been played.
          </p>
          <p>
            Qwen&apos;s 0.5 billion parameters are also a real limit. It compresses a long battle with hidden information
            into a small internal representation and does no search while playing. A larger model might help, but it
            would inherit the same missing-data problem: the replays still do not show what would have happened after
            an unplayed move. I would only compare model sizes while keeping the numeric action scorer, dataset, and
            battle schedule unchanged.
          </p>
          <p>
            The practical limit was storage. I stopped after two disjoint 0.5% Metamon slices because prepared rows,
            converted numeric files, downloaded archives, and saved models filled the space available on my
            computer. The source corpus contains far more data, but I could not test a larger slice on this machine.
            Another training run would first need more storage. After that, I would collect search estimates for
            actions the replays did not take and train the model to choose its starting Pokémon.
          </p>
        </section>

        <footer className="article-footer">
          <p>Source code: <a href="https://github.com/DylanB03/pokemonBattlerML">github.com/DylanB03/pokemonBattlerML</a></p>
          <p>
            Training data: <a href="https://github.com/UT-Austin-RPL/metamon">Metamon</a> (published as CC BY-NC
            4.0). Battles ran through <a href="https://pokemonshowdown.com/">Pokémon Showdown</a>.
          </p>
        </footer>
      </article>
    </SiteShell>
  )
}
