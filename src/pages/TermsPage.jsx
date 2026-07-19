import LegalPageShell, { LegalSection, LegalLink, LegalList } from "../components/legal/LegalPageShell";
import { usePageMeta } from "../lib/seo";

const TermsPage = () => {
  usePageMeta({
    title: "Terms of Service",
    description: "Terms of Service for Startathon, Kerala's 30-hour student hackathon organized by Coding Club, SCTCE.",
    path: "/terms",
  });

  return (
    <LegalPageShell eyebrow="Legal" title="Terms of Service" updated="19 July 2026">
      <LegalSection title="Who we are">
        <p>
          Startathon is a 30-hour in-person hackathon organized by Coding Club, SCTCE
          (Sree Chitra Thirunal College of Engineering), Thiruvananthapuram, Kerala. These
          terms govern your use of this website and your participation in the event. By
          applying, registering a team, or otherwise using this site, you agree to them.
        </p>
      </LegalSection>

      <LegalSection title="Eligibility and applications">
        <p>
          Startathon is open to college students, in teams of three to four. Submitting
          an application does not guarantee a spot — only 20 teams are selected, based on idea
          quality and team profile, at the organizers&apos; discretion. We may reject or revoke
          an application at any time, including after acceptance.
        </p>
      </LegalSection>

      <LegalSection title="Fees and payment">
        <p>
          Confirmed teams pay a ₹100 registration fee (reduced to ₹90 with a valid referral
          code — see the <LegalLink to="/referral-program">Referral Program Rules</LegalLink>).
          Fees are non-refundable except at the organizers&apos; discretion, including if the
          event is cancelled.
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
          You and your team retain ownership of what you build during the event. By
          participating, you grant Startathon, Coding Club SCTCE, and event sponsors a
          non-exclusive license to demo, photograph, record, and showcase your submission and
          team for judging and promotional purposes.
        </p>
        <p>
          Event sponsors may be inspired by ideas, problem statements, or approaches shown at
          the event to independently develop their own products or solutions. This does not
          give a sponsor the right to copy, reproduce, or directly use your code, designs, or
          other work product without your separate agreement.
        </p>
      </LegalSection>

      <LegalSection title="Photography and media">
        <p>
          The event may be photographed, filmed, or live-streamed. By attending, you consent
          to appearing in this media and to its use in Startathon&apos;s promotional materials.
        </p>
      </LegalSection>

      <LegalSection title="Referral program">
        <p>
          Teams get a referral code they can share for a registration discount, and can earn a
          payout for teams that use it. The program has its own rules, including what counts as
          abuse and our right to deny or reverse credit — see the{" "}
          <LegalLink to="/referral-program">Referral Program Rules</LegalLink>, which are part
          of these Terms.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer and limitation of liability">
        <p>
          This site and the event are provided as-is. To the fullest extent permitted by law,
          Coding Club SCTCE and Startathon organizers are not liable for indirect, incidental,
          or consequential damages arising from your participation or use of this site.
          Participation in the in-person event is at your own risk.
        </p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>
          We may update these terms as the event evolves. Material changes will update the
          date above. Continued use of the site after a change means you accept the revised
          terms.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>These terms are governed by the laws of India, with courts in Kerala having jurisdiction.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms: <LegalLink href="mailto:support@sctcoding.club">support@sctcoding.club</LegalLink>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
};

export default TermsPage;
