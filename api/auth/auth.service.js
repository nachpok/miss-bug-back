import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { loggerService } from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET1 || 'This_is_a_very_secret_key')

export const authService = {
    getLoginToken,
    validateToken,
    login,
    signup,
    validateUserByCookie
}


function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    try {
        const json = cryptr.decrypt(token)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        console.log('Invalid login token')
    }
    return null
}

async function login(username, password) {
    console.log("auth.service - login")
    try {
        var user = await userService.getByUsername(username)
        if (!user) throw 'Unkown username'

        const match = await bcrypt.compare(password, user.password)
        if (!match) throw 'Invalid username or password'

        const miniUser = _getMiniUser(user)
        return miniUser
    } catch (err) {
        console.log('auth.service - Invalid login token')
    }
    return null
}

async function loginOnSingup(user) {
    const miniUser = _getMiniUser(user)
    return miniUser
}


function _getMiniUser(user) {
    return {
        _id: user._id,
        fullname: user.fullname,
    }
}


async function validateUserByCookie(req, res) {
    console.log("auth.service - validateUserByCookie")
    const token = req.cookies['loginToken']
    const user = validateToken(token)
    if (!user) return res.status(401).send('Unauthorized')
    const miniUser = {
        _id: user._id,
        fullname: user.fullname,
        // imgUrl: user.imgUrl,
        // score: user.score,

        // isAdmin: user.isAdmin,
        // Additional fields required for miniuser
    }
    return miniUser

}
//TODO: handle exsisting username
async function signup({ username, password, fullname }) {
    const saltRounds = 10
    loggerService.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !fullname) throw 'Missing required signup information'

    const userExist = await userService.getByUsername(username)
    if (userExist) return { error: 'Username already taken' };

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.save({ username, password: hash, fullname })
}