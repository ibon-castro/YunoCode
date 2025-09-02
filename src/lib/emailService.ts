import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'YunoCode';
const EMAILJS_INVITATION_TEMPLATE_ID = 'template_i9fdrvu';  
const EMAILJS_CONTACT_TEMPLATE_ID = 'template_5zz7zej';
const EMAILJS_PUBLIC_KEY = 'WWhzhR_x-4vKYTvXI';

interface InvitationEmailData {
  email: string;
  projectName: string;
  inviterName: string;
  invitationToken: string;
  inviterUsername?: string;
}

interface ContactEmailData {
  name: string;
  email: string;
  message: string;
}

export const sendInvitationEmail = async (data: InvitationEmailData) => {
  try {
    // Create the email parameters that match your EmailJS template
    const templateParams = {
      to_email: data.email,
      project_name: data.projectName,
      inviter_name: data.inviterUsername || data.inviterName,
      invitation_link: `${window.location.origin}/accept-invitation?token=${data.invitationToken}`,
      to_name: data.email.split('@')[0], // Use email username as name
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_INVITATION_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
};

export const sendContactEmail = async (data: ContactEmailData) => {
  try {
    const templateParams = {
      name: data.name,
      email: data.email,
      message: data.message,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_CONTACT_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Contact email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send contact email:', error);
    return { success: false, error: error.message };
  }
};