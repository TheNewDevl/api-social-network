const appConfig = {

    get port(): number {
        return parseInt(this.getEnvValue('APP_PORT'))
    },

    get secret(): string {
        return this.getEnvValue('SECRET_KEY')
    },

    getEnvValue(key: string) {
        const value = process.env[key]
        if (!value) {
            throw new Error(`You must specify ${key}. Check you .env values.`);
        }
        return value
    }
}
export default appConfig