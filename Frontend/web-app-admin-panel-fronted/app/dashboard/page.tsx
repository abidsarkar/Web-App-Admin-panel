export default async function Page() {
  const response = await fetch(
    "http://localhost:5001/api/v1/text/get?fields=address"
  );
  if(!response){
    console.log("no response")
  }
  const result = await response.json();

  // Access the address string directly from the data object
  const addressString = result.data.address;

  console.log(addressString);

  // Check if the address exists before displaying
  if (!addressString) {
    return <p>Address data not found.</p>;
  }

  // Display the single string value
  return (
    <div>
      <h3>Current Address:</h3>
      <p>{addressString}</p>
    </div>
  );
}
