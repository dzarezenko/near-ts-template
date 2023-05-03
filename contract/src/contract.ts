import { NearBindgen, near, call, view } from 'near-sdk-js';

@NearBindgen({})
class Contract {
  
  counter: number = 0;

  @view({})
  getCounter(): number {
    return this.counter;
  }

  @call({})
  increaseCounter(): void {
    near.log(`Inc counter by ${near.predecessorAccountId()}`);
    this.counter++;
  }

  @call({})
  decreaseCounter(): void {
    if (this.counter == 0) {
      throw new Error("Can't decrease counter");
    }

    near.log(`Dec counter by ${near.predecessorAccountId()}`);
    this.counter--;
  }

  @call({ privateFunction: true })
  resetCounter(): void {
    this.counter = 0;
  }

  @call({ payableFunction: true })
  setCounter({ value }: { value: number }): void {
    if (near.attachedDeposit() < 1e22) {
      throw Error("Deposit amount should be >= 0.01 NEAR");
    }
    near.log(`Deposit amount ` + near.attachedDeposit());

    this.counter = value;
  }

}
