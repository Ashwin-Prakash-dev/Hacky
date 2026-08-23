import LegalPageShell, {
  LegalSection,
  LegalLink,
  LegalList,
} from "../components/legal/LegalPageShell";
import { usePageMeta } from "../lib/seo";
import { SELECTION_FEE_DUE_LONG } from "../lib/phase";

const TermsPage = () => {
  usePageMeta({
    title: "Terms of Service",
    description:
      "Terms of Service for Startathon, Kerala's 30-hour student hackathon organized by Coding Club, SCTCE.",
    path: "/terms",
  });

  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terms of Service"
      updated="23 August 2026"
    >
      <LegalSection title="Who we are">
        <p>
          Startathon is a 30-hour in-person hackathon organized by Coding Club,
          SCTCE (Sree Chitra Thirunal College of Engineering),
          Thiruvananthapuram, Kerala. These terms govern your use of this
          website and your participation in the event. By applying, registering
          a team, or otherwise using this site, you agree to them.
        </p>
      </LegalSection>

      <LegalSection title="Eligibility and applications">
        <p>
          Startathon is open to college students, in teams of three to four.
          Submitting an application does not guarantee a spot — only 20 teams
          are selected, based on idea quality and team profile, at the
          organizers&apos; discretion. We may reject or revoke an application at
          any time, including after acceptance.
        </p>
      </LegalSection>

      <LegalSection title="Fees and payment">
        <p>
          Confirmed teams pay a ₹100 registration fee (reduced to ₹90 with a valid
          referral code — see the{" "}
          <LegalLink to="/referral-program">Referral Program Rules</LegalLink>).
          Fees are non-refundable except at the organizers&apos; discretion,
          including if the event is cancelled. Selected teams pay a ₹250
          per-member selection fee, which is separate from the registration fee.
          The selection fee is due after selection, and must be paid by all team
          members to confirm participation. Payment instructions will be
          provided to selected teams. If any member of a selected team has not
          paid by the deadline below, the team is disqualified from the event
          and the selection fees that team has already paid are refunded.
        </p>
        <p>
          The selection fee is refundable until {SELECTION_FEE_DUE_LONG}. Ask
          for a refund by emailing{" "}
          <a
            href="mailto:support@sctcoding.club"
            className="text-lime/80 underline underline-offset-[3px]"
          >
            support@sctcoding.club
          </a>{" "}
          before that time, from the address on the account that paid. After it
          passes, the selection fee is non-refundable except at the
          organizers&apos; discretion.
        </p>
      </LegalSection>

      <LegalSection title="Event conduct">
        <LegalList
          items={[
            "Harassment, discrimination, cheating, plagiarism, and disruptive behavior are not tolerated.",
            "We may remove any participant or team from the event, at any stage, for violating these terms or acting in bad faith.",
            "Startathon runs fully in-person at SCTCE, Thiruvananthapuram. Dates, venue, prize pool, and problem statement are subject to change.",
          ]}
        />
      </LegalSection>

      <LegalSection title="What you build">
        <p>
          You and your team retain ownership of what you build during the event.
          By participating, you grant Startathon, Coding Club SCTCE, and event
          sponsors a non-exclusive license to demo, photograph, record, and
          showcase your submission and team for judging and promotional
          purposes.
        </p>
        <p>
          Event sponsors may be inspired by ideas, problem statements, or
          approaches shown at the event to independently develop their own
          products or solutions, and may copy, reproduce, or use designs shown
          at the event.
        </p>
      </LegalSection>

      <LegalSection title="Photography and media">
        <p>
          The event may be photographed, filmed, or live-streamed. By attending,
          you consent to appearing in this media and to its use in
          Startathon&apos;s promotional materials.
        </p>
      </LegalSection>

      <LegalSection title="Referral program">
        <p>
          Teams get a referral code they can share for a registration discount,
          and can earn a payout for teams that use it. The program has its own
          rules, including what counts as abuse and our right to deny or reverse
          credit — see the{" "}
          <LegalLink to="/referral-program">Referral Program Rules</LegalLink>,
          which are part of these Terms.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer and limitation of liability">
        <p>
          This site and the event are provided as-is. To the fullest extent
          permitted by law, Coding Club SCTCE and Startathon organizers are not
          liable for indirect, incidental, or consequential damages arising from
          your participation or use of this site. Participation in the in-person
          event is at your own risk.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms as the event evolves. Material changes will
          update the date above. Continued use of the site after a change means
          you accept the revised terms.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of India, with courts in Kerala
          having jurisdiction.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms:{" "}
          <LegalLink href="mailto:support@sctcoding.club">
            support@sctcoding.club
          </LegalLink>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
};

export default TermsPage;
