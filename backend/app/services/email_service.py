from typing import List
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from app.models.email_list import EmailList
from pydantic import EmailStr
import logging

logger = logging.getLogger(__name__)

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_TLS,
    MAIL_SSL_TLS=settings.MAIL_SSL,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS
)

class EmailService:
    def __init__(self):
        self.fastmail = FastMail(conf)

    async def send_email_list(self, email_list: EmailList):
        if not email_list.recipients:
            logger.warning(f"No recipients for email list {email_list.id}")
            return

        recipients = [r['email'] for r in email_list.recipients if 'email' in r]
        
        message = MessageSchema(
            subject=email_list.subject,
            recipients=recipients,
            body=email_list.body,
            subtype=MessageType.html
        )

        try:
            await self.fastmail.send_message(message)
            logger.info(f"Email list {email_list.id} sent successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to send email list {email_list.id}: {str(e)}")
            raise e

    async def send_registration_confirmation(self, user_email: str, event_title: str, ticket_type: str, qr_code: str):
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">Registration Confirmed!</h2>
                <p>Hello,</p>
                <p>You have successfully registered for <strong>{event_title}</strong>.</p>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Ticket Type:</strong> {ticket_type}</p>
                    <p style="margin: 0;"><strong>Confirmation Code:</strong> {qr_code}</p>
                </div>
                <p>Please have this confirmation ready (digital or printed) when you arrive at the event.</p>
                <p>Thank you,<br>UMEB Management Team</p>
            </div>
        </body>
        </html>
        """
        
        message = MessageSchema(
            subject=f"Confirmation: {event_title}",
            recipients=[user_email],
            body=body,
            subtype=MessageType.html
        )

        try:
            await self.fastmail.send_message(message)
            logger.info(f"Registration confirmation sent to {user_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send confirmation to {user_email}: {str(e)}")
            return False

email_service = EmailService()
