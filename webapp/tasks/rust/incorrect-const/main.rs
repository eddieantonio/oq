let PI = 3.141592653589793;

fn area(radius: f64) -> f64 {
    return PI * radius * radius;
}

fn main() {
    println!("The area of the circle is: {}", area(1.128375));
}
