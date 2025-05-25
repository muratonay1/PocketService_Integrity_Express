import PocketLog from './PocketLog.js';
class PocketResponse {
    static Success(input) {
        return input;
    }
    static Failure(error){
        PocketLog.error(error.message);
        throw new Error(error.message);
    }
}
export default PocketResponse;
