import { User} from "./user.types";

declare global{
    namespace Express {
        export interface Request {
            user?:Users;
        }
    }
}
export{}