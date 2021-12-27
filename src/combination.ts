/**
 * Math class to compute [combinations](https://en.wikipedia.org/wiki/Combination).
 * Copied and adapted from tslib project.
 * @typeParam T The type of combination.
 */
export default class Combination<T> {

  /**
   * Array of pointers, of size k (see constructor).
   * Each pointer, points to an element of n (see constructor)
   * and all pointed to elements, together form a single combination.
   * 
   * It is guaranteed that the pointers always point to the next combination,
   * until no more combinations are available.
   */
  private pointers: number[] = [];

  /**
   * Number of remaining combinations.
   */
  private numberOfCombinations: number;

  /**
   * Creates a Combination from the supplied elements n and the size k each combination should have.
   * @param n Number of elements.
   * @param k Size each combination should have.
   */
  constructor(private n: Array<T>, private k: number) {
    if (k > n.length || k < 0) {
      throw new RangeError('k must be smaller or equal to n and may not be negative!');
    }

    // Initialize pointers so they point to the first combination
    for (let i = 0; i < k; ++i) {
      this.pointers[i] = i;
    }

    this.numberOfCombinations =  Combination.factorial(n.length) / (Combination.factorial(n.length - k) * Combination.factorial(k));
  }

  /**
   * Determines if another combination is available or not.
   * @returns True when another combination exists, otherwise false is returned.
   */
  public hasNext(): boolean {
    return this.numberOfCombinations > 0;
  }

  /**
   * Gets the next combination.
   * @returns The next combination when one is available.
   * @throws An Error when there was no available combination.
   */
  public next(): Array<T> {
    const combination = new Array<T>();

    if (this.hasNext()) {
      for (let i = 0; i < this.k; ++i) {
        combination[i] = this.n[this.pointers[i]];
      }

      --this.numberOfCombinations;
      this.incrementPointers();
    } else {
      throw new Error('All combinations have been exhausted!');
    }

    return combination;
  }

  /**
   * Increments pointers in such a way that they point to the next combination.
   * The following example should make the working of pointers clear.
   * Assume we have a set of 4 elements (n=4) and we want to get all combinations of size 2 (k=2).
   * Since k=2 we need two pointers (0 and 1) that initially point to the first combination.
   * <pre><code>
   * a b c d
   * 0 1      a,b: This is the situation after construction of an instance.
   * 0   1    a,c: Increment first pointer from the right that can be incremented.
   * 0     1  a,d: Increment first pointer from the right that can be incremented.
   *          The second pointer can't be incremented,
   *          so we look to the left for a pointer that can be incremented.
   *          Now adjust all pointer after the one that was incremented.
   *   0 1    b,c: Increment first pointer from the right that can be incremented.
   *   0   1  b,d: Increment first pointer from the right that can be incremented.
   *     0 1  c,d: No pointer can be incremented.
   * </code></pre>
   * At this point we can't increment any pointer anymore since we have exhausted our combinations.
   */
  private incrementPointers() {
    if (this.hasNext()) {
      // Locate the first pointer from the right that when incremented would not overflow.
      let i = this.k - 1;
      while (this.pointers[i] == this.n.length - this.k + i) {
        --i;
      }

      if (i >= 0) {
        // Increment the last pointer that can be incremented
        this.pointers[i] += 1;

        // Now update all pointers after the pointer that was incremented.
        for (let j = i + 1; j < this.k; ++j) {
          this.pointers[j] = this.pointers[i] + j - i;
        }
      }
    }
  }

  /**
   * Computes the factorial of n.
   * 
   * The largest factorial that will result in an integer value is 21.
   * @param n Number for which to calculate the factorial.
   * @returns n!
   * @throws A RangeError when n is negative.
   */
  public static factorial(n: number): number {
    if (n < 0) throw new RangeError(`Can't compute the factorial of negative number: ${n}`);

    let result = 1;
    for (let i = 1; i <= n; ++i) {
      result *= i;
    }

    return result;
  }

}
