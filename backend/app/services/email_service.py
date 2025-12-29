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

email_service = EmailService()
