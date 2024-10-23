let count1 = 0
let sa = document.getElementById("sa")
let count = document.getElementById("count")

function increment() {
  count1++
  count.textContent = count1
}

function decrement() {
  --count1
  count.textContent = count1
}

function save() {
  let countStr = " " + count1 + " - "
  sa.innerText += countStr
  console.log(count)
}
