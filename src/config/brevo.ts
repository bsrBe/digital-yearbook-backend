import SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY as string;

export const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<void> => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: process.env.BREVO_SENDER_NAME || 'YearbookPro',
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@yearbookpro.com',
  };
  sendSmtpEmail.to = [{ email: to }];

  try {
    await transactionalEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email Error: ${(error as Error).message}`);
    throw error;
  }
};

export default sendEmail;
