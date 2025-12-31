from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Any
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "UMEB Management Platform"
    API_V1_STR: str = "/api/v1"
    
    # DATABASE
    # Default to docker-compose service name 'db'
    DATABASE_URL: str = "postgresql://user:password@db:5432/umeb"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None) -> str:
        if v and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v
    
    # SECURITY
    SECRET_KEY: str = "YOUR_SECRET_KEY_HERE_CHANGE_IN_PRODUCTION" # TODO: Change this
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # EMAIL
    MAIL_USERNAME: str = "your_email@example.com"
    MAIL_PASSWORD: str = "your_password"
    MAIL_FROM: str = "your_email@example.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_TLS: bool = True
    MAIL_SSL: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
        
    # CORS
    BACKEND_CORS_ORIGINS: List[str] | str = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip().startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
