import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/preferences");
  }

  return (
    <div className="homePage">
      <div className="row justify-content-center">
        <div style={{ maxWidth: 600 + 'px' }}>
          <img
            className="row justify-content-center"
            src="https://media.discordapp.net/attachments/416523883651530752/777827729395548200/FRSSAT2020_Banner1.png?width=960&height=584"
            alt="FRSSAT2021 Logo Banner"
          />
        </div>
      </div>
      <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
        <h1>
          Welcome to the Sign-up Site for&nbsp;
          <strong>Flight Rising Secret Santa Art Trade 2021!</strong>
        </h1>
      </div>
      <div className="container-fluid" style={{ maxWidth: 970 + 'px' }}>
        <p>
          This site is designed to guide you through the sign up process before
          providing you with the post to copy paste onto the FR forums!
          <br /><br />
          Don't know what that is? Find out in our&nbsp;
          <a href="https://www1.flightrising.com/forums/cc/3078024"
          >official forum thread</a
          >. For more details on sign-up, refer to the&nbsp;
          <a
            href="https://www1.flightrising.com/forums/cc/3079245"
          >sign-up thread</a
          >. <strong>Sign-ups close Saturday December 5th at rollover.</strong>
          <br /><br />Please refrain from using the back button or reloading the page.
          No personal data is
          collected or stored. We are neither affiliated with nor endorsed by
          Stormlight Workshop LLC.
        </p>
      </div>
      <br />
      <div className="row justify-content-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleClick}
            style={{ marginBottom: 5 + '%' }}
          >
            Let's Get Started!
          </button>
      </div>
    </div>
  );
}
