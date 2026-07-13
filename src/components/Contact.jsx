import WaitlistForm from "./WaitlistForm";

const Contact = () => (
  <div
    id="contact"
    className="w-screen"
    style={{ background: "#0a0a0a", padding: "7rem 0" }}
  >
    <div className="container mx-auto px-5 md:px-10">
      <div style={{ maxWidth: "580px", margin: "0 auto" }}>
        <WaitlistForm />
      </div>
    </div>
  </div>
);

export default Contact;
