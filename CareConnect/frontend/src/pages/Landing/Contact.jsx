import LandingLayout from '../../layouts/LandingLayout';
import Input from '../../components/common/Input';
import TextArea from '../../components/common/TextArea';
import Button from '../../components/common/Button';
import { Mail, User, Send } from 'lucide-react';

export default function Contact() {
  return (
    <LandingLayout>
      <div className="container-page py-32">
        <div className="mx-auto max-w-lg">
          <h1 className="text-center font-display text-4xl font-extrabold text-ink">Get in touch</h1>
          <p className="mt-3 text-center text-muted">
            Questions about partnering with BloodLink AI? We usually reply within a day.
          </p>
          <form className="mt-10 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input label="Full name" icon={User} placeholder="Jane Doe" />
            <Input label="Email address" type="email" icon={Mail} placeholder="you@example.com" />
            <TextArea label="Message" placeholder="How can we help?" rows={5} />
            <Button variant="primary" size="lg" icon={Send} className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </LandingLayout>
  );
}
