function test(bool) {
  console.log(arguments)
  if (bool) {
    let a = 1;
    console.log(a);
  }
  a = 2;
  console.log(a);
}

test(false)