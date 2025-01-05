import { useEffect, useState } from "react";
import "./YourLinks.css"

function YourLinks() {
  const [links, setLinks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    fetch("/api/links/get-favorites")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch links");
        }
        return response.json();
      })
      .then((data) => {
        setLinks(data); // Save links to state
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const deleteLink = async (id) => {
    try {
      const response = await fetch("/api/links/delete-favorite", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link_id: id }), // Ensure the key matches the backend's expected key
      });

      if (!response.ok) {
        throw new Error("Failed to delete the link");
      }

      const result = await response.json(); // Assuming the backend returns JSON (you can adjust this)
      console.log(result.message); // Log the response from backend, e.g., "Link deleted"

      // Remove the link from the list
      setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
    } catch (error) {
      console.error("Error deleting link:", error.message);
    }
  };

  return (
    <div>
      <h1>Your Saved Links</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {links.length > 0 ? (
          links.map((link) => (
            <li key={link.id}>
              <h2>{link.link_title}</h2> {/* Corrected field name */}
              <a href={link.link} target="_blank" rel="noopener noreferrer">
                Visit Resource
              </a>
              <button onClick={() => deleteLink(link.id)}>Delete</button>{" "}
              {/* Attach delete function */}
            </li>
          ))
        ) : (
          <p>No saved links yet!</p>
        )}
      </ul>
    </div>
  );
}

export default YourLinks;
