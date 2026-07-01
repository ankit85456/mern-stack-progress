import { useState } from "react";

function App() {
  const [name, setName] = useState("");

  // onClick
  const handleClick = () => {
    alert("Button Clicked!");
  };

  // onChange
  const handleChange = (e) => {
    setName(e.target.value);
  };

  // onSubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Welcome ${name}`);
  };

  // onMouseOver
  const handleMouseOver = () => {
    alert("Mouse is over the button!");
  };

  // onKeyDown
  const handleKeyDown = (e) => {
    console.log("Key Pressed:", e.key);
  };

  // onFocus
  const handleFocus = () => {
    console.log("Input Focused");
  };

  // onBlur
  const handleBlur = () => {
    console.log("Input Lost Focus");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>React Events Example</h1>

      <hr />

      {/* onClick */}
      <h2>1. onClick</h2>
      <button onClick={handleClick}>Click Me</button>

      <hr />

      {/* onChange */}
      <h2>2. onChange</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={handleChange}
      />
      <p>Name: {name}</p>

      <hr />

      {/* onSubmit */}
      <h2>3. onSubmit</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>

      <hr />

      {/* onMouseOver */}
      <h2>4. onMouseOver</h2>
      <button onMouseOver={handleMouseOver}>
        Hover Over Me
      </button>

      <hr />

      {/* onKeyDown */}
      <h2>5. onKeyDown</h2>
      <input
        type="text"
        placeholder="Press any key"
        onKeyDown={handleKeyDown}
      />

      <hr />

      {/* onFocus & onBlur */}
      <h2>6. onFocus & onBlur</h2>
      <input
        type="text"
        placeholder="Click here"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  );
}

export default App;


//promise example

const myPromise = new Promise((resolve, reject) => {
  let success = true;

  if (success) {
    resolve("Data fetched successfully");
  } else {
    reject("Something went wrong");
  }
});

myPromise
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
