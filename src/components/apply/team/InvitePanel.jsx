import { useState } from "react";
import TerminalInput from "../inputs/TerminalInput";
import { Panel, Eyebrow, ErrorLine, NoticeLine, PrimaryButton } from "../ui";

const InvitePanel = ({ onInvite, busy, error, sentTo }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onInvite(email.trim().toLowerCase(), name.trim(), () => {
      setEmail("");
      setName("");
    });
  };

  return (
    <Panel maxWidth="none">
      <Eyebrow>INVITE A TEAMMATE</Eyebrow>
      <form onSubmit={submit} noValidate style={{ marginTop: "0.75rem" }}>
        <TerminalInput
          label="Email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TerminalInput
          label="Name (required if they don't have an account yet)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <ErrorLine>{error}</ErrorLine>
        <NoticeLine>{sentTo && `invite sent to ${sentTo} — they'll get an email`}</NoticeLine>
        <PrimaryButton type="submit" disabled={busy}>
          {busy ? "sending…" : "Send invite"}
        </PrimaryButton>
      </form>
    </Panel>
  );
};

export default InvitePanel;
