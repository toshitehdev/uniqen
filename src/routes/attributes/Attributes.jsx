import React, { useState, useEffect } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { style } from "../../style";

function Attributes() {
  const { id } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [img, setImg] = useState("");
  const navigate = useNavigate();
  const [nav, setNav] = useState("");
  useEffect(() => {
    async function fetchToken() {
      const call = await axios.get(
        `https://ipfs.io/ipfs/bafybeibqknpxt2dc2s3o5ulfsvqognymzzaot2xk6hkwonhq3qmyerljfe/${
          id ? id : 0
        }.json`
      );
      const str = call.data.image.slice(7);
      const imgUrl = `https://ipfs.io/ipfs/${str}`;
      setTokenData(call.data);
      setImg(imgUrl);
      setAttributes(call.data.attributes);
      console.log(call.data);
    }
    fetchToken();
  }, [id]);
  const renderAttributes = () => {
    if (attributes.length > 0) {
      return attributes.map((item, index) => {
        return (
          <div key={index}>
            <p className="text-xs lg:text-sm leading-7 tracking-wide">
              <span className="text-gray-400 font-bold italic">{`${item.trait_type}`}</span>{" "}
              : {`${item.value}`}
            </p>
          </div>
        );
      });
    }
  };
  return (
    <div>
      <p>Token Attributes </p>
      <div className="mt-5">
        <input
          className="border border-teal-500 w-24 mr-3 py-2 px-5"
          type="number"
          onChange={(e) => setNav(e.target.value)}
        />
        <button
          className={style.btnUniversal}
          onClick={() => {
            if (!nav) return;
            navigate(`/app/attributes/${nav}`);
          }}
        >
          Search
        </button>
      </div>
      <div className="w-1/3 mx-auto my-0 mt-14">
        <img src={img} alt="" className="mb-4" />
        <p className="mb-4">
          {/* Name: UNIQEN #{tokenData.edtion ? tokenData.edtion : ""} */}
        </p>
        {renderAttributes()}
      </div>
    </div>
  );
}

export default Attributes;
