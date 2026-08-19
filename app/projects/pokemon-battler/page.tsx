import type { Metadata } from "next"
import Link from "next/link"
import { PolicyDiagram } from "@/components/policy-diagram"
import { SiteShell } from "@/components/site-shell"

export const metadata: Metadata = {
  title: "Training a 0.5B Pokémon model to win on the ranked ladder — Dylan Butz",
  description:
    "How I rebuilt a Pokémon battle policy's loss, representation, and data pipeline before it finished with a win rate above 50% across 1,000 public ranked games.",
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
          I started by fine-tuning Qwen to write two-character action IDs. I finished with a hybrid policy that
          played 1,000 public Pokémon Showdown games with a win rate above 50%. The useful part was everything that
          failed between those two points.
        </p>

        <section className="result-panel" aria-labelledby="result-heading">
          <div className="result-panel-copy">
            <p className="eyebrow" id="result-heading">Final public result</p>
            <p className="result-record">502–498</p>
            <p>
              One frozen checkpoint, one fixed team, 770 opponents, and 30,385 policy decisions. No learning or
              search ran between games.
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
            My target was a Generation 9 OU policy built around{" "}
            <a href="https://huggingface.co/Qwen/Qwen2.5-0.5B">Qwen2.5-0.5B</a>. Given the public state of a
            battle, it had to rank the legal moves, switches, and Terastallized moves. I kept the model small
            because it fit on my 8 GB GPU in 4-bit NF4 with LoRA adapters. More parameters would have made every
            experiment slower without proving the pipeline was sound.
          </p>
          <p>The action space looks simple. Each turn has at most thirteen choices:</p>
          <ul>
            <li><code>A0–A3</code>: ordinary moves</li>
            <li><code>A4–A8</code>: available switches</li>
            <li><code>A9–A12</code>: the four moves with Terastallization enabled</li>
          </ul>
          <p>
            Those IDs are positional. <code>A4</code> can mean switching to Corviknight in one position and Great
            Tusk in another. The policy cannot memorize a global meaning for the output neuron; it has to compare
            the current state with the current candidates.
          </p>
          <p>The first unfine-tuned answer was syntactically confident and completely useless:</p>
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
            My original supervised fine-tuning objective treated an action as text. Qwen generated a string such
            as <code>A4</code> followed by an end-of-sequence token. The training loss fell to about 0.6, yet exact
            action agreement stayed near 29%.
          </p>
          <p>
            Tokenization explained the mismatch. <code>A4</code> becomes the repeated token <code>A</code>, one
            decision-bearing digit, and EOS. The easy <code>A</code> and EOS tokens pulled the average down. I had
            optimized the model to spell the answer template, then read that number as if it measured battle
            decisions.
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
            I replaced text generation with one cross-entropy over the legal candidates. If <code>s(a)</code> is
            the score for a legal action, the loss is:
          </p>
          <div className="equation" role="img" aria-label="Negative log likelihood of the target score over all legal action scores">
            L = −log [ exp s(a<sub>target</sub>) / Σ<sub>a ∈ legal</sub> exp s(a) ]
          </div>
          <p>
            This made the displayed loss rise to roughly 1.8 early in training. That looked worse, but it was the
            first honest number: one error for one decision. Uniform choice had an average negative log likelihood
            of 2.127, so 1.8 was already better than uniform even though it was nowhere near good enough.
          </p>
        </section>

        <aside className="pull-quote"><p>A legal mask can prevent nonsense. It cannot choose the best legal move.</p></aside>

        <section>
          <h2>Legality and quality are different metrics</h2>
          <p>
            Pokémon Showdown supplies the exact legal choices for a live turn. I set every illegal logit to
            negative infinity before the softmax, so an illegal action has zero probability and cannot win the
            argmax. This guarantees legal output from the system.
          </p>
          <p>
            It says nothing about whether the model should use Earthquake, preserve a win condition, switch out of
            a bad matchup, or spend Tera. My early “100% legal-action rate” was an implementation property, not a
            model result. Once I separated those ideas, I stopped using legality as evidence that the policy had
            learned anything.
          </p>
          <p>
            The new candidate head reached 36.52% exact agreement on a fixed 1,024-row validation sample. This was
            net accuracy over the complete decision, not the easier score where the correct move-versus-switch
            category is supplied first. It was a real gain, but the loss and validation curve still flattened
            halfway through the first dataset pass.
          </p>
        </section>

        <section>
          <h2>I cut prose and added mechanics</h2>
          <p>
            The first state format repeated XML tags, field names, and default values. Its median length was 2,057
            tokens. A versioned compact serializer brought that down to 1,157 tokens, a 44% reduction. That mattered
            because selective vocabulary projection can skip part of the language-model head, but it does not skip
            transformer attention or MLP work across the prompt.
          </p>
          <p>
            Prompt compression only made the same information cheaper. The deeper issue was what I was asking a
            0.5B language model to infer. A move name stands for type, power, priority, accuracy, status chance,
            recoil, healing, stat changes, hazard effects, and dozens of special cases. Those are database facts,
            not language reasoning.
          </p>
          <p>
            I built a mechanics tensor for every candidate. It included type effectiveness, STAB, expected damage,
            priority, PP, status probabilities, stat-stage changes, healing, recoil, hazard interaction, switch HP
            after entry, and matchup pressure. The first version reduced each candidate to 97 numeric values and
            cut the state prompt to about 466 tokens.
          </p>
          <p>
            Then I measured collisions. In 2,880 rows, at least two legal actions had identical 97-value vectors.
            The recorded action sat inside one of those tied groups 780 times. Rest and Sleep Talk could look the
            same. So could Reflect and Light Screen, or Spikes and Stealth Rock. No optimizer can separate identical
            inputs.
          </p>
          <p>
            The fix was not to return to raw prose. I expanded the representation to 207 numeric mechanics values
            plus 32 categorical fields with learned embeddings for moves, species, items, abilities, types,
            statuses, field effects, and history. Numeric features support generalization; identities preserve
            special cases that should not be crushed into one flag.
          </p>
          <div className="comparison-bars" role="img" aria-label="Exact action agreement improved from 36.52 percent to 41.89 percent on the fixed validation sample">
            <div className="comparison-row">
              <div className="comparison-label"><span>Candidate head</span><span>36.52%</span></div>
              <div className="comparison-track"><span style={{ width: "73.04%" }} /></div>
            </div>
            <div className="comparison-row">
              <div className="comparison-label"><span>Mechanics v2</span><span>41.89%</span></div>
              <div className="comparison-track"><span style={{ width: "83.78%" }} /></div>
            </div>
            <p>Exact agreement on the same fixed 1,024 validation rows.</p>
          </div>
          <p>
            The completed mechanics-v2 evaluation reached 42.86% top-1, 64.78% top-2, and 78.78% top-3 agreement
            over 5,000 rows. Changing the representation added more than five points on the fixed comparison without
            changing Qwen.
          </p>
        </section>

        <section>
          <h2>The policy that actually played</h2>
          <p>
            The final model is neither plain Qwen nor a rules engine. Qwen produces a learned distribution over the
            legal actions. A structured interaction sidecar scores those same actions from mechanics, identities,
            stable team rosters, and four observable transitions. I blend their legal log probabilities, then take
            the highest-scoring action.
          </p>
          <PolicyDiagram />
          <p>
            Qwen remains part of every live decision. The sidecar does the work that fits compact tensors better:
            comparing candidate mechanics with both teams and recent events. Pokémon Showdown provides the rules and
            legal mask, but it never recommends a move. There is no MCTS, Foul Play, or battle-search engine at
            inference time.
          </p>
        </section>

        <section>
          <h2>Better proxy losses did not mean more wins</h2>
          <p>
            I tried to move from replay agreement to battle outcomes too early. A five-batch public PPO campaign
            played 500 rated games and finished 178–322, or 35.6%. It produced locally promoted checkpoints, but
            one hundred terminal win/loss labels spread across thousands of decisions are a weak training signal. A
            loss does not identify the move that caused it, and a win does not make every earlier move correct.
          </p>
          <p>
            Foul Play distillation had a different problem. The teacher supplied search-backed action values, but my
            early collection contained about 51,000 labels from 1,000 battles against six training teams. Repeating
            those rows improved teacher agreement without creating matchup coverage. A later residual policy reduced
            soft KL and improved teacher top-1 agreement, then tied the incumbent exactly in held-out battles.
          </p>
          <p>
            Recurrent trajectory training also failed its battle gate. The public trace explained why the proxy
            metrics were so forgiving: after forced switches, the policy attacked 88.0% of the time, switched 11.5%,
            and used Tera 0.5%. Ordinary attacks dominate replay cross-entropy. A model can improve that loss while
            continuing to avoid the rare decisions that determine games.
          </p>
          <table>
            <thead><tr><th>Attempt</th><th>What improved</th><th>What happened in games</th></tr></thead>
            <tbody>
              <tr><td>Public PPO</td><td>Local promotion chain</td><td>178–322 public aggregate</td></tr>
              <tr><td>Foul Play DAgger</td><td>Teacher agreement</td><td>12 wins vs. incumbent&apos;s 9; too noisy</td></tr>
              <tr><td>Trajectory IQL</td><td>~44% validation agreement</td><td>20 wins vs. incumbent&apos;s 21</td></tr>
              <tr><td>Residual policy</td><td>Lower teacher KL</td><td>Exact held-out battle tie</td></tr>
            </tbody>
          </table>
          <p>
            This changed how I selected checkpoints. Loss became a diagnostic, not a promotion rule. A candidate had
            to survive held-out replay slices and direct battles on matched schedules. A long run was not evidence by
            itself.
          </p>
        </section>

        <section>
          <h2>The missing variable was data coverage</h2>
          <p>
            The early datasets were too small and too repetitive for the claim I wanted to make. I moved to the{" "}
            <a href="https://github.com/UT-Austin-RPL/metamon">Metamon self-play corpus</a>, which contains millions
            of trajectories and a much wider team pool. I kept both wins and losses. An action-value head learned the
            final outcome, a state-value head used an expectile target, and advantage-weighted cloning controlled how
            strongly the actor copied each logged decision.
          </p>
          <p>
            The logged outcome still cannot tell me what would have happened after an unplayed move. It is not a
            counterfactual label. It is better than throwing away every loss or treating every move in a win as
            equally good.
          </p>
          <figure className="pipeline-figure">
            <div className="pipeline">
              <div><span>01</span><strong>Metamon archives</strong><small>stream compressed data</small></div><i aria-hidden="true">→</i>
              <div><span>02</span><strong>Hash sampling</strong><small>disjoint 0.5% slices</small></div><i aria-hidden="true">→</i>
              <div><span>03</span><strong>Interaction cache</strong><small>tensorize once</small></div><i aria-hidden="true">→</i>
              <div><span>04</span><strong>Sidecar training</strong><small>actor + value heads</small></div><i aria-hidden="true">→</i>
              <div><span>05</span><strong>Battle gates</strong><small>freeze, compare, deploy</small></div>
            </div>
            <figcaption>
              Sampling happens before inner replay decoding. Atomic shards and memory-mapped feature caches let a
              stopped run resume without expanding the full archive or reparsing every row.
            </figcaption>
          </figure>
          <p>
            This scale forced me to rewrite preparation. The source archive is read as a compressed stream. A
            deterministic hash rejects unsampled members before JSON decoding. Four CPU workers construct state,
            write atomic JSONL shards, and build memory-mapped interaction caches. Later epochs read mechanics,
            identities, outcomes, and byte offsets directly instead of parsing more than a million JSON rows again.
          </p>
          <p>
            The first large run kept 34,524 trajectories and 1,249,105 decisions. On a paired 100-game held-out
            schedule, its policy finished 48–52 while the old champion finished 30–70. That 18-point difference was
            the first battle result large enough to justify continuing a model instead of replacing it.
          </p>
        </section>

        <section>
          <h2>Continuation mattered more than another restart</h2>
          <p>
            The second large run sampled the next non-overlapping 0.5% hash window: 34,735 trajectories and
            1,259,031 transitions. It loaded the v1 sidecar instead of reinitializing it, then mixed 377,170 v1
            examples into each epoch for a 25% rehearsal share. That protected old coverage while the new slice
            supplied new positions.
          </p>
          <p>
            Validation action agreement rose from 60.94% to 62.20%, switch agreement rose from 50.36% to 52.83%,
            and loss fell from 1.5474 to 1.4964. A battle sweep selected a sidecar weight of 0.75. On a separate
            200-game schedule, v2 finished 109–91 while v1 finished 96–104.
          </p>
          <p>
            My automatic gate still kept v1 because the paired bootstrap interval crossed zero. I left that strict
            result intact, but v2 had the best blend-sweep point estimate and the stronger 200-game result, so I
            chose it for the public measurement. This was a judgment call, not a silent rewrite of the gate.
          </p>
        </section>

        <section>
          <h2>One thousand public games</h2>
          <p>
            I froze the selected Metamon v2 policy and ran it greedily on the public Generation 9 OU ladder. Four
            battles could run concurrently. The submitted team stayed fixed, while the team-preview lead was
            randomized because this policy has no learned preview head.
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
              <tr><td>95% Wilson interval</td><td>47.1–53.3%</td></tr>
              <tr><td>Different opponents</td><td>770</td></tr>
              <tr><td>Policy decisions</td><td>30,385</td></tr>
              <tr><td>Policy fallbacks</td><td>0</td></tr>
              <tr><td>Mean battle length</td><td>24.8 turns</td></tr>
            </tbody>
          </table>
          <p>
            The final margin is four games. The confidence interval includes 50%, so I cannot claim that the true
            ladder win rate is reliably above even. I can claim that this frozen policy completed 1,000 games with a
            positive record, no heuristic fallbacks, and a much stronger result than the earlier 35.6% campaign.
          </p>
        </section>

        <section>
          <h2>What I learned</h2>
          <ol>
            <li><strong>Loss has to match deployment.</strong> A small causal-language-model loss was almost useless when deployment took an argmax over action IDs. Direct masked cross-entropy made the problem visible.</li>
            <li><strong>A mask is a constraint, not intelligence.</strong> Guaranteed legality belongs next to input validation. The learned result is how the policy ranks the legal choices.</li>
            <li><strong>Representation bugs can look like optimizer problems.</strong> The numeric-only candidate schema created exact collisions. Adding identities fixed an impossible learning problem.</li>
            <li><strong>State coverage beat narrow online learning.</strong> Millions of diverse offline decisions did more for battle performance than repeated 100-game PPO batches or a small teacher set.</li>
            <li><strong>Continue a measured gain.</strong> V2 extended the v1 sidecar and rehearsed old rows. It did not throw away the first large run to test another architecture from zero.</li>
            <li><strong>Publish the pooled result.</strong> The 53% first slice became 50.2% after 1,000 games. Stopping when the graph looks good is checkpoint selection by luck.</li>
          </ol>
        </section>

        <section>
          <h2>What is still missing</h2>
          <p>
            The final result uses one fixed player team, so it measures that deployed setup rather than general
            team-building ability. Team preview is random. Four recent transitions are not a complete belief state
            for hidden moves, items, abilities, speed ranges, or Tera types. Logged outcomes supervise the action
            that happened; they do not value every legal alternative.
          </p>
          <p>
            The 0.5B encoder is also a real limit. It compresses a long, partially observed battle into a small
            representation and does no search at inference time. A larger encoder might help, but it would inherit
            the same data and counterfactual problems. I would only compare model sizes after holding the structured
            policy, dataset, and battle schedule constant.
          </p>
          <p>
            The practical limit was storage. I stopped after two disjoint 0.5% Metamon slices because prepared rows,
            interaction caches, downloaded archives, and checkpoints filled the space available on my computer. The
            source corpus contains far more data, but I could not test a larger slice on this machine. More storage
            would be the first requirement for the next training run, followed by search-backed values for unplayed
            actions and a learned team-preview policy.
          </p>
          <p>
            A positive 1,000-game record is not the end state I had in mind. It is the first result in this project
            that survived a long public test. I now know which changes caused it: a decision-level objective,
            mechanics without identity loss, broad offline coverage, continuation with rehearsal, and evaluation
            that was allowed to contradict me.
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
