import { authService } from "../api/auth/auth.service.js";
import { asyncLocalStorage } from "../services/als.service.js";

export async function setupAsyncLocalStorage(req, res, next) {
  const storage = {};

  asyncLocalStorage.run(storage, () => {
    if (!req.cookies?.loginToken) return next();
    const loggedinUser = authService.validateToken(req.cookies.loginToken);
    console.log("__als.logedinUser", loggedinUser);
    if (loggedinUser) {
      const alsStore = asyncLocalStorage.getStore();
      alsStore.loggedinUser = loggedinUser;
    }
    next();
  });
}
