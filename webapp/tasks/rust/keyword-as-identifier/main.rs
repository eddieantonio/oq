fn main() {
    let non_ref = 421.0;
    let ref = 324.0;

    let ratio = ref / non_ref;

    println!("The percentage of refs to non-refs is {}.", 100.0 * ratio);
}
