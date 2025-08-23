import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userFirstname?: string;
  userEmail?: string;
}

export const WelcomeEmail = ({
  userFirstname = 'User',
  userEmail = 'user@example.com',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to lnd-boilerplate - Your journey starts here!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png`}
          width="170"
          height="50"
          alt="lnd-boilerplate"
          style={logo}
        />
        <Heading style={h1}>Welcome to lnd-boilerplate!</Heading>
        <Text style={heroText}>
          Hi {userFirstname}, we're excited to have you on board!
        </Text>
        
        <Section style={codeBox}>
          <Text style={confirmationCode}>
            Your account has been successfully created with email: {userEmail}
          </Text>
        </Section>

        <Text style={text}>
          lnd-boilerplate is a modern, production-ready landing page boilerplate 
          built with Next.js, TypeScript, and Tailwind CSS. Here's what you can do next:
        </Text>

        <Section style={featuresContainer}>
          <Text style={featureTitle}>🚀 Quick Start</Text>
          <Text style={featureText}>
            Clone the repository and run <code style={code}>bun run dev</code> to get started
          </Text>
          
          <Text style={featureTitle}>📚 Documentation</Text>
          <Text style={featureText}>
            Check out our comprehensive documentation to learn about all features
          </Text>
          
          <Text style={featureTitle}>🎨 Customization</Text>
          <Text style={featureText}>
            Customize colors, fonts, and layouts to match your brand
          </Text>
          
          <Text style={featureTitle}>📱 PWA Ready</Text>
          <Text style={featureText}>
            Your site is already configured as a Progressive Web App
          </Text>
        </Section>

        <Section style={buttonContainer}>
          <Link style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/docs`}>
            View Documentation
          </Link>
        </Section>

        <Text style={footer}>
          Best regards,<br />
          The lnd-boilerplate Team
        </Text>
        
        <Text style={footerLinks}>
          <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/privacy`} style={footerLink}>
            Privacy Policy
          </Link>
          {' • '}
          <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/terms`} style={footerLink}>
            Terms of Service
          </Link>
          {' • '}
          <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`} style={footerLink}>
            Unsubscribe
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const heroText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
};

const codeBox = {
  background: 'rgb(245, 244, 245)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
};

const confirmationCode = {
  color: '#000',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 'bold',
  lineHeight: '24px',
  padding: '16px',
  textAlign: 'center' as const,
  width: '100%',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'center' as const,
};

const featuresContainer = {
  margin: '32px 0',
};

const featureTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 8px 0',
};

const featureText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px 0',
};

const buttonContainer = {
  margin: '27px auto',
  width: 'auto',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
  margin: '0 auto',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const footerLinks = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#8898aa',
  textDecoration: 'underline',
};

const code = {
  backgroundColor: '#f4f4f4',
  padding: '2px 4px',
  borderRadius: '3px',
  fontFamily: 'monospace',
};
