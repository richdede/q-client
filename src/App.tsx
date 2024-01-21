import React, { useCallback } from "react";
// const BASE_URL = "http://localhost:3330/api/v1";
const BASE_URL = "https://q-server.onrender.com/api/v1";

type sectorT = {
  createdAt: string;
  group: string;
  name: string;
  updatedAt: string;
  __v: number | undefined;
  _id: string;
};

function App() {
  const [sectors, setSectors] = React.useState<
    { group: string; data: sectorT[] }[]
  >([]);
  const [formData, setFormData] = React.useState({
    name: "",
    sector: "",
    agreeWithTerms: null,
  });
  const [applicationID, setApplicationID] = React.useState("");

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(formData);
    if (
      formData.name == "" ||
      formData.sector == "" ||
      !formData.agreeWithTerms
    )
      return;
    try {
      const res = await fetch(`${BASE_URL}/applicant`, {
        method: applicationID ? "PATCH" : "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          agreeWithTerms: true,
          applicationID: applicationID ? applicationID : "",
        }),
      });
      if (res.ok) {
        const result = await res.json();
        alert(result.message);
        setApplicationID(result.id);
        localStorage.setItem("applicationID", JSON.stringify(result.id));
        setFormData({
          name: "",
          sector: "",
          agreeWithTerms: null,
        });
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  }

  function handlerChanges(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function getSelectors() {
    try {
      const res = await fetch(`${BASE_URL}/sector`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      const result = await res.json();
      const sectorsData = [];
      const groupedData = result.data.sectors.reduce(
        (result: { [x: string]: sectorT[] }, sector: sectorT) => {
          const group = sector.group;

          if (!result[group]) {
            result[group] = [];
          }

          result[group].push(sector);
          return result;
        },
        {}
      );

      for (const key in groupedData) {
        if (Object.prototype.hasOwnProperty.call(groupedData, key)) {
          const elements = groupedData[key];
          sectorsData.push({
            group: key,
            data: elements,
          });
        }
      }

      setSectors(sectorsData);
    } catch (error) {
      console.log(error);
    }
  }
  const getApplicant = useCallback(async () => {
    if (applicationID == "") return;
    try {
      const res = await fetch(`${BASE_URL}/applicant/${applicationID}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      const result = await res.json();
      setFormData({
        name: result.data.applicant.name,
        sector: result.data.applicant.sector._id,
        agreeWithTerms: result.data.applicant.agreeWithTerms,
      });
    } catch (error) {
      console.log(error);
    }
  }, [applicationID]);

  React.useEffect(() => {
    getSelectors();
  }, []);

  React.useEffect(() => {
    setApplicationID(
      localStorage.getItem("applicationID")
        ? JSON.parse(localStorage.getItem("applicationID") ?? "")
        : ""
    );
    getApplicant();
  }, [applicationID, getApplicant]);

  return (
    <>
      <div className="container">
        <form action="" onSubmit={submitHandler}>
          <p>
            Please enter your name and pick the Sectors you are currently
            involved in.
          </p>
          <label htmlFor="name">
            Name
            <input
              type="text"
              placeholder="Enter your name"
              id="name"
              name="name"
              required
              onChange={handlerChanges}
              value={formData.name}
            />
          </label>
          <label htmlFor="sectors">
            Sector
            <select
              name="sector"
              id="sectors"
              required
              onChange={(e) => {
                setFormData({ ...formData, [e.target.name]: e.target.value });
              }}
              value={formData.sector}
            >
              <option value="">Select your sector</option>
              {sectors.map((sec, i) => (
                <optgroup label={sec.group} key={i}>
                  {sec.data.map((el, i) => (
                    <option value={el._id} key={i}>
                      {el.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label htmlFor="agreed">
            <input
              type="checkbox"
              required
              id="agreed"
              name="agreeWithTerms"
              onChange={handlerChanges}
              checked={formData.agreeWithTerms ?? false}
            />
            Agree to terms
          </label>
          <button type="submit">Save</button>
        </form>
      </div>
    </>
  );
}

export default App;
