import { authService } from "./auth.service.js";
import { loggerService } from "./../../services/logger.service.js";

export async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await authService.login(username, password);
    const loginToken = authService.getLoginToken(user);
    loggerService.info("User login: ", user);
    res.cookie("loginToken", loginToken, { sameSite: "None", secure: true });
    res.json(user);
  } catch (err) {
    loggerService.error("Failed to Login " + -err);
    res.status(401).send({ err: "Failed to Login" });
  }
}

export async function signup(req, res) {
  try {
    const credentials = req.body;
    const account = await authService.signup(credentials);
    if (account?.error) {
      return res.status(409).send({ err: account.error });
    }
    loggerService.debug(
      `auth.route - new account created: ` + JSON.stringify(account)
    );

    const username = credentials.username;
    const password = credentials.password;
    const user = await authService.login(username, password);
    loggerService.info("User signup:", user);

    const loginToken = authService.getLoginToken(user);
    res.cookie("loginToken", loginToken, { sameSite: "None", secure: true });
    const miniUser = {
      _id: user._id,
      fullname: user.fullname,
      role: user.role,
    };
    res.status(201).json(miniUser);
    return;
  } catch (err) {
    loggerService.error("Failed to signup " + err);
    res.status(400).send({ err: "Failed to signup" });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("loginToken");
    res.send({ msg: "Logged out successfully" });
  } catch (err) {
    res.status(400).send({ err: "Failed to logout" });
  }
}

export async function validateUserByCookie(req, res) {
  const user = await authService.validateUserByCookie(req, res);
  res.json(user);
}
