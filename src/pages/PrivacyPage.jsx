import LegalPageShell, { LegalSection, LegalLink, LegalList } from "../components/legal/LegalPageShell";
import { usePageMeta } from "../lib/seo";

const PrivacyPage = () => {
  usePageMeta({
    title: "Privacy Policy",
    description: "Privacy Policy for Startathon, Kerala's 30-hour student hackathon organized by Coding Club, SCTCE.",
    path: "/privacy",
  });

  return (
    <LegalPageShell eyebrow="Legal" title="Privacy Policy" updated="19 July 2026">
      <LegalSection title="What we collect">
        <LegalList
          items={[
            "Waitlist: name, email, college, and phone number if you give it.",
            "Account: name, email, password, phone, college, and gender when you sign up, or your name, email, and profile photo if you sign in with Google.",
            "Team & application data: teammates, invites, and your team's idea submission once applications open.",
            "Payment reference: the UPI transaction ID your team leader submits to confirm registration. We don't process or store card or bank details ourselves.",
          ]}
        />
      </LegalSection>

      <LegalSection title="How we use it">
        <p>
          To run Startathon: reviewing applications, managing teams and invites, processing
          registration payments and referral discounts, and emailing or messaging you about the
          event. We don&apos;t sell your data or use it for advertising.
        </p>
      </LegalSection>

      <LegalSection title="Where it's stored">
        <p>
          Your data is stored on our backend at <code>api.sctcoding.club</code>. Your sign-in
          session is kept in your browser&apos;s local storage so you stay logged in — clearing
          your browser data signs you out.
        </p>
      </LegalSection>

      <LegalSection title="Third parties">
        <LegalList
          items={[
            <>Google — if you sign in with Google, Google shares your name, email, and profile photo with us. See Google&apos;s own privacy policy for how they handle your data.</>,
            <>WhatsApp — waitlist confirmation links to a WhatsApp community group, which is governed by WhatsApp&apos;s privacy policy once you join.</>,
          ]}
        />
      </LegalSection>

      <LegalSection title="Cookies and tracking">
        <p>
          This site doesn&apos;t use tracking cookies, ads, or third-party analytics. Browser
          local storage is used only to keep you signed in.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep your data for as long as needed to run the event and for reasonable
          record-keeping afterward. You can ask us to delete it at any time (see below).
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Email <LegalLink href="mailto:support@sctcoding.club">support@sctcoding.club</LegalLink> to
          access, correct, or delete the data we hold about you. We&apos;ll respond as soon as
          we reasonably can.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this policy as the event evolves. Material changes will update the date
          above.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about this policy: <LegalLink href="mailto:support@sctcoding.club">support@sctcoding.club</LegalLink>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
};

export default PrivacyPage;
