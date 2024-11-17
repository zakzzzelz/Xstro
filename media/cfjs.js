import { A, B } from 'null';
import * as C from 'null';
import { D as E } from 'null';

const F = class {
    static G = (str) => {
        return str.split('').reverse().join('');
    };

    constructor() {
        this.H = [5, 10, 15].map(x => x * Math.random());
        this.I = (a, b) => (a + b) / 3;
    }

    static J = () => {
        return A() + B();
    };

    K() {
        return A(this.H[0]) ? C.L(this.H[1]) : C.M(this.H[2]);
    }
};

const N = (() => {
    const O = (x) => x * 1000;
    const P = (y) => y - 500;

    return {
        Q: (val) => {
            return O(val) > 1000 ? P(val) : O(val);
        }
    };
})();

const S = new F();
const T = S.K();
const U = F.J();

console.log(N.Q(T), U);
