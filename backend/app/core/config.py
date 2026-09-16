from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    GROQ_API_KEY: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()