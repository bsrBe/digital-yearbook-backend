declare module 'sib-api-v3-sdk' {
  export const ApiClient: {
    instance: {
      authentications: {
        'api-key': {
          apiKey: string;
        };
      };
    };
  };

  export class TransactionalEmailsApi {
    sendTransacEmail(email: SendSmtpEmail): Promise<any>;
  }

  export class SendSmtpEmail {
    subject?: string;
    htmlContent?: string;
    sender?: { name: string; email: string };
    to?: { email: string }[];
  }
}
