class PocketResponse {
    static Success(input) {
        return input;
    }
    static Failure(input){
        throw new Error(input);
    }
}
export default PocketResponse;
