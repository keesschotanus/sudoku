class Combinations<T> {

    private pointers: number[]= [];

    constructor(private n: Array<T>, private r: number) {
        // Initialize pointers
        for (let i = 0; i < r; ++i) {
            this.pointers[i] = i;
        }
    }

    getCombination(): Array<T> {
        let result = new Array<T>();
        for (let i = 0; i < this.r; ++i) {
            result[i] = this.n[this.pointers[i]];
        }

        return result;
    }

}

let c = new Combinations<number>([1, 2, 3], 2);
console.log(c.getCombination());
