export function convertWeight(weight) {
  // weight comes in hectograms from API
  const kg = weight / 10
  const lbs = weight * 0.2204623

  return [kg, lbs]
}

export function calculateLKGKBasePower(weight) {
  // assumes kg
  if (weight >= 200.0) return 120
  if (weight >= 0.1 && weight <= 9.9) return 20
  if (weight >= 10.0 && weight <= 24.9) return 40
  if (weight >= 25.0 && weight <= 49.9) return 60
  if (weight >= 50.0 && weight <= 99.9) return 80
  if (weight >= 100.0 && weight <= 199.9) return 100
}

export function calculateHSHCBasePower(userWeight, targetWeight) {
  // assumes kg
  const ratio = userWeight / targetWeight

  if (ratio < 2) return 40
  if (ratio >= 5) return 120
  if (ratio < 3 && ratio >= 2) return 60
  if (ratio < 4 && ratio >= 3) return 80
  if (ratio < 5 && ratio >= 4) return 100
}

export function expandAPIName(name) {
  const nameSplit = name.split("-")
  const nameArrCapped = nameSplit.map(name => { 
    return name.charAt(0).toUpperCase() + name.slice(1)
  })

  return nameArrCapped.join(" ")
}