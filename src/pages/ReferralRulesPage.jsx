import LegalPageShell, { LegalSection, LegalLink, LegalList } from "../components/legal/LegalPageShell";
import { usePageMeta } from "../lib/seo";

const ReferralRulesPage = () => {
  usePageMeta({
    title: "Referral Program Rules",
    description: "How Startathon referral codes work, payouts, and program rules.",
    path: "/referral-program",
  });

  return (
    <LegalPageShell eyebrow="Referral program" title="Startathon referral codes" updated="19 July 2026">
      <LegalSection title="How it works">
        <p>
          Every team gets its own referral code as soon as it&apos;s created — find it on your
          team dashboard.
        </p>
        <p>
          <strong className="text-white">Give your code to other teams.</strong> Share your
          code with any team that hasn&apos;t paid yet. When they enter it and pay, they get
          10% off the team registration fee — ₹90 instead of ₹100 — and you earn ₹10.
        </p>
        <p>
          <strong className="text-white">Use someone else&apos;s code.</strong> Got a code from
          another team? The team leader can enter it on the team dashboard before paying. Your
          fee drops to ₹90 once it&apos;s applied.
        </p>
      </LegalSection>

      <LegalSection title="A few things to know">
        <LegalList
          items={[
            "Only the team leader can enter a referral code.",
            "You can enter or change a code as many times as you like — but only before you pay. Once your payment is confirmed, it's locked in for good.",
            "You can't use your own team's code on yourself.",
            "There's no limit to how many teams can use your code — refer as many as you want.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Referrer payout">
        <p>
          You earn ₹10 for every team that pays using your code, with no cap on how many. Payouts
          are made by UPI after the event, to the details your team leader provides.
        </p>
      </LegalSection>

      <LegalSection title="Program terms">
        <p>
          Referral codes are for genuine teams referring genuine teams. Creating fake or
          duplicate teams, colluding with other teams, trading or selling codes, or any other
          way of manipulating referral counts counts as abuse.
        </p>
        <LegalList
          items={[
            "A team found abusing the referral program may be disqualified from Startathon entirely, not just stripped of referral credit — at the organizers' sole discretion.",
            "We may review, deny, reverse, or withhold any referral discount or payout — including one already applied — if we suspect abuse or error.",
            "Referral payouts are not guaranteed. They depend on the referred team completing registration and the event taking place, and are paid only after the event.",
            "We may change, pause, or end the referral program at any time, without notice.",
            "Our decisions on referral eligibility and payouts are final.",
          ]}
        />
        <p>
          This page is part of, and should be read together with, our{" "}
          <LegalLink to="/terms">Terms of Service</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Referral disputes or questions:{" "}
          <LegalLink href="mailto:support@sctcoding.club">support@sctcoding.club</LegalLink>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
};

export default ReferralRulesPage;
