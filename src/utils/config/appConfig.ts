import * as dotenv from 'dotenv';
dotenv.config();

const appConfig = {
  get port(): number {
    return parseInt(this.getEnvValue('APP_PORT'));
  },

  get ACCESS_TOKEN_KEY(): string {
    return this.getEnvValue('ACCESS_TOKEN_KEY');
  },

  get REFRESH_TOKEN_KEY(): string {
    return this.getEnvValue('REFRESH_TOKEN_KEY');
  },

  getEnvValue(key: string) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`You must specify ${key}. Check you .env values.`);
    }
    return value;
  },
};
export default appConfig;
