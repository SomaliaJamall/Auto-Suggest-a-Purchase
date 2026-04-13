import SuggestionForm from './suggestionForm'
import useToken from './useToken';

function App() {
  const { token, setToken } = useToken();
  return (
    <div style={{ width: "600px" }}>
      {/* <div className="form-group row justify-content-center">
        <div className="col-4" style={{ textAlign: "right" }}>
          <img className='img-fluid' src={myLogo} />
        </div>
        <div className="col-8">
          <h3 style={{ color: "#0569B3" }}>Suggest a Purchase</h3>
        </div>
      </div> */}

      < SuggestionForm token={token}></SuggestionForm>
    </div >
  )
}

export default App
