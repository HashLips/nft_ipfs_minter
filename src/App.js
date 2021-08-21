import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import { create } from "ipfs-http-client";
import SignatureCanvas from "react-signature-canvas";

const ipfsClient = create("https://ipfs.infura.io:5001/api/v0");

export const StyledButton = styled.button`
  padding: 8px;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [NFTS, setNFTS] = useState([]);
  const elementRef = useRef();
  const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/";
  const name = "NFT name";
  const description = "IPFS minted nft woooooo.";

  console.log(NFTS);

  const mint = (_uri) => {
    blockchain.smartContract.methods
      .mint(blockchain.account, _uri)
      .send({ from: blockchain.account })
      .once("error", (err) => {
        console.log(err);
        setLoading(false);
        setStatus("Error");
      })
      .then((receipt) => {
        console.log(receipt);
        setLoading(false);
        clearCanvas();
        dispatch(fetchData(blockchain.account));
        setStatus("Successfully minting your NFT");
      });
  };

  const createMetaDataAndMint = async (_name, _des, _imgBuffer) => {
    setLoading(true);
    setStatus("Uploading to IPFS");
    try {
      const addedImage = await ipfsClient.add(_imgBuffer);
      const metaDataObj = {
        name: _name,
        description: _des,
        image: ipfsBaseUrl + addedImage.path,
      };
      const addedMetaData = await ipfsClient.add(JSON.stringify(metaDataObj));
      console.log(ipfsBaseUrl + addedMetaData.path);
      mint(ipfsBaseUrl + addedMetaData.path);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setStatus("Error");
    }
  };

  const startMintingProcess = () => {
    createMetaDataAndMint(name, description, getImageData());
  };

  const getImageData = () => {
    const canvasEl = elementRef.current;
    let dataUrl = canvasEl.toDataURL("image/png");
    const buffer = Buffer(dataUrl.split(",")[1], "base64");
    return buffer;
  };

  const fetchMetatDataForNFTS = () => {
    setNFTS([]);
    data.allTokens.forEach((nft) => {
      fetch(nft.uri)
        .then((response) => response.json())
        .then((metaData) => {
          setNFTS((prevState) => [
            ...prevState,
            { id: nft.id, metaData: metaData },
          ]);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };

  const clearCanvas = () => {
    const canvasEl = elementRef.current;
    canvasEl.clear();
  };

  useEffect(() => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  }, [blockchain.smartContract, dispatch]);

  useEffect(() => {
    fetchMetatDataForNFTS();
  }, [data.allTokens]);

  return (
    <s.Screen>
      {blockchain.account === "" || blockchain.smartContract === null ? (
        <s.Container flex={1} ai={"center"} jc={"center"}>
          <s.TextTitle>Connect to the Blockchain</s.TextTitle>
          <s.SpacerSmall />
          <StyledButton
            onClick={(e) => {
              e.preventDefault();
              dispatch(connect());
            }}
          >
            CONNECT
          </StyledButton>
          <s.SpacerSmall />
          {blockchain.errorMsg !== "" ? (
            <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
          ) : null}
        </s.Container>
      ) : (
        <s.Container flex={1} ai={"center"} style={{ padding: 24 }}>
          <s.TextTitle style={{ textAlign: "center" }}>
            Welcome mint your signature
          </s.TextTitle>
          {loading ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                loading...
              </s.TextDescription>
            </>
          ) : null}
          {status !== "" ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                {status}
              </s.TextDescription>
            </>
          ) : null}
          <s.SpacerLarge />
          <s.Container fd={"row"} jc={"center"}>
            <StyledButton
              onClick={(e) => {
                e.preventDefault();
                startMintingProcess();
              }}
            >
              MINT
            </StyledButton>
            <s.SpacerSmall />
            <StyledButton
              onClick={(e) => {
                e.preventDefault();
                clearCanvas();
              }}
            >
              CLEAR
            </StyledButton>
          </s.Container>
          <s.SpacerLarge />
          <SignatureCanvas
            backgroundColor={"#3271bf"}
            canvasProps={{ width: 350, height: 350 }}
            ref={elementRef}
          />
          <s.SpacerLarge />
          {data.loading ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: "center" }}>
                loading...
              </s.TextDescription>
            </>
          ) : (
            NFTS.map((nft, index) => {
              return (
                <s.Container key={index} style={{ padding: 16 }}>
                  <s.TextTitle>{nft.metaData.name}</s.TextTitle>
                  <img
                    alt={nft.metaData.name}
                    src={nft.metaData.image}
                    width={150}
                  />
                </s.Container>
              );
            })
          )}
        </s.Container>
      )}
    </s.Screen>
  );
}

export default App;
