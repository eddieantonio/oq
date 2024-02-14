fn convert() -> f64 {
    return (fahrenheit - 32.0) / 1.8;
}

fn main() {
    println!("{} fahrenheit is {} celsius\n", 68.0, convert(68.0));
}
