import { authService } from './auth.service.js'
import { loggerService } from './../../services/logger.service.js';

export async function login(req, res) {
    console.log("login")
    const { username, password } = req.body
    console.log("username", username)
    console.log("password", password)
    try {
        console.log("auth.controller - login")
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)
        loggerService.info('User login: ', user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
    } catch (err) {
        loggerService.error('Failed to Login ' + -err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function signup(req, res) {
    try {
        const credentials = req.body
        console.log(credentials)
        // Never log passwords
        // loggerService.debug(credentials)
        const account = await authService.signup(credentials)
        loggerService.debug(`auth.route - new account created: ` + JSON.stringify(account))

        const user = await authService.login(credentials.username, credentials.password)
        loggerService.info('User signup:', user)

        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })

        res.json(user)
    } catch (err) {
        loggerService.error('Failed to signup ' + err)
        res.status(400).send({ err: 'Failed to signup' })
    }
}

export async function logout(req, res) {
    try {
        console.log("auth.controller - logout")
        res.clearCookie('loginToken')
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(400).send({ err: 'Failed to logout' })
    }
}