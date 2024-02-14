fn fibonacci(n: u64) -> u64 {
    let mut now = 0;
    let mut next = 1;
    while n > 0 {
        let temp = now + next;
        now = next;
        next = temp;
        n = n - 1;
    }

    now
}

fn main() {
    println!("the 7th fibonacci number is {}", fibonacci(7));
}
