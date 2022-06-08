const dbConfig = {
  get host(): string {
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
      return this.getEnvValue('DB_HOST_DEV');
    } else {
      return this.getEnvValue('DB_HOST_PROD');
    }
  },

  get type(): 'mysql' {
    return this.getEnvValue('DB_TYPE') as 'mysql';
  },

  get password(): string {
    return this.getEnvValue('DB_PASSWORD');
  },

  get username(): string {
    return this.getEnvValue('DB_USERNAME');
  },

  get name(): string {
    return this.getEnvValue('DB_NAME');
  },

  get port(): number {
    return parseInt(this.getEnvValue('DB_PORT')) || 3306;
  },

  getEnvValue(key: string) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`You must specify ${key}. Check you .env values.`);
    }
    return value;
  },
};
export default dbConfig;
