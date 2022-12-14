/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable react/prop-types */
import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import 'animate.css';
import ImageUploadWidget from '../../app/common/ImageUploadWidget';
import Swal from 'sweetalert2';

let now = new Date();
now = + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
const today = new Date().toISOString().substring(0, 10);
const currentTime = now + ' ' + today;

const API_BASE = process.env.REACT_APP_SERVER_API;

const EditCard = (props) => {
  const {qrText} = useParams();
  const [isAuth, setIsAuth] = useState(false);
  const [cardInfo, setCardInfo] = useState([]);
  const [inputPassword, setInputPassword] = useState('');

  useEffect(() => {
    getCardInfo(qrText);
  }, [qrText]);

  const getCardInfo = async (qrText) => {
    await fetch(API_BASE + '/card/' + qrText)
        .then((res) => res.json())
        .then((data) => setCardInfo(data))
        .catch((err) => console.error(err));
  };

  const ElInputPassword = document.getElementById('input-edit-password');

  const [isSamePassword, setIsSamePassword] = useState('false');
  const [textIsSamePassword, setTextIsSamePassword] = useState('');

  // mid auth page
  const checkPassword = async (e) => {
    e.preventDefault();

    // cardInfo.map(async (card) => {
    const verifyPassword = await fetch(API_BASE + '/card/edit/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        cardCode: qrText,
        password: inputPassword,
      }),
    }).then((res) => res.json());

    if (!verifyPassword.error) {
      setIsAuth(true);
      setTextIsSamePassword('');
    } else {
      ElInputPassword.value = '';
      setIsSamePassword('false');
      setTextIsSamePassword('Try Again, it is wrong password');
    };
  };

  return (
    <>
      <div className="input-container">
        { isAuth ? (
                    <Edit qrText={qrText} cardInfo={cardInfo}/>
                ) :
                    <div className="background">
                      <div className="container-edit-password" style={{textAlign: 'center'}} >
                        <form className="input-form-password" onSubmit={checkPassword}>
                          <h2 style={{fontSize: '18px'}}>Password for editing <b>{qrText}</b></h2>
                          <input type="password" id='input-edit-password'
                            onChange={(e) => setInputPassword(e.target.value)}></input>
                          <button className='btn-edit-password' type="submit" style={{fontSize: '18px'}}>Enter</button>
                          <div className='edit-password-confirm' id="edit-password">
                            <span className="confirmSamePassword" id={isSamePassword}>{textIsSamePassword}</span>
                          </div>
                          <div className='search-href' style={{marginTop: '6rem'}}>
                            <a style={{color: 'grey', fontSize: '15px'}} href={'/search/' + qrText}>Back to card info</a>
                          </div>
                        </form>
                      </div>
                    </div>
        }
      </div>
    </>
  );
};

const Edit = ({cardInfo, qrText, cardId}) => {
  let submitCard = {};
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birth, setBirth] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [homePhone, setHomePhone] = useState('');
  const [cellPhone, setCellPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [addInfo, setAddInfo] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState();

  const [isSamePassword, setIsSamePassword] = useState('false');
  const [textIsSamePassword, setTextIsSamePassword] = useState('');

  const [isToggleOn, setIsToggleOn] = useState(false);
  const [isHiden, setIsHiden] = useState(true);
  const [disableForm, setDisableForm] = useState(false);

  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
        window.innerWidth <= 1024 ? setIsMobile(true) : setIsMobile(false);
  }, [qrText, window.innerWidth]);

  const handlePasswordClick = () => {
    if (isToggleOn === false) {
      setIsToggleOn(true);
      setIsHiden(false);
    } else {
      setIsToggleOn(false);
      setIsHiden(true);
    }
  };

  const checkPasswordIsSame = (e) => {
    if (password === e.target.value) {
      setDisableForm(false);
      setTextIsSamePassword(<i className='bi bi-check'></i>);
      setIsSamePassword('true');
    } else {
      setDisableForm(true);
      setTextIsSamePassword('The password confirmation does not match');
      setIsSamePassword('false');
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();

    cardInfo.map((card) => {
      submitCard = card;
    });

    const object = {
      cardCode: qrText,
      firstName: firstName === '' ? submitCard.firstName : firstName,
      lastName: lastName === '' ? submitCard.lastName : lastName,
      imageUrl: imageUrl === '' ? submitCard.imageUrl : imageUrl,
      birth: birth === '' ? submitCard.birth : birth,
      homePhone: homePhone === '' ? submitCard.homePhone : homePhone,
      cellPhone: cellPhone === '' ? submitCard.cellPhone : cellPhone,
      schoolName: schoolName === '' ? submitCard.schoolName : schoolName,
      schoolPhone: schoolPhone === '' ? submitCard.schoolPhone : schoolPhone,
      addInfo: addInfo === '' ? submitCard.addInfo : addInfo,
      password: password === '' ? submitCard.password : password,
      issueDate: submitCard.issueDate,
      lastUpdateDate: currentTime,
    };

    const formData = new FormData();

    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        formData.append(key, object[key]);
      }
    }

    formData.append('Image', image);
    fetch(API_BASE + '/card/edit/' + qrText, {
      method: 'PUT',
      body: formData,
    }).then((res) => res.json())
        .finally(setTimeout(function() {
          navigate(`/result`, {state: {qrText: qrText}});
        }, 400))
        .catch((err) => console.error(err));
  };

  const deleteCard = async (cardInfo) => {
    const imgName = cardInfo[0].imageUrl.slice(50).replace( /%20/gi, ' ');

    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#326E39',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (cardInfo[0].imageUrl) {
          await fetch(API_BASE + '/delete-image-test', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({key: imgName}),
          })
              .then((res) => res.json())
              .catch((err) => console.error(err));
        }

        await fetch(API_BASE + '/card/delete/' + cardInfo[0]._id, {method: 'DELETE'})
            .then((res) => res.json())
            .then((res) => console.log('card delete'));

        Swal.fire(
            'Deleted!',
            'Your card has been deleted.',
            'success',
        ).finally(navigate(`/`));
      }
    });
  };

  return (
    <div className="input-container">
      <div className="input-form-container">
        <div className="input-form-title">
          <h2>Edit information card</h2>
        </div>
        <div className="container">
          <form className="input-form" onSubmit={submitForm}>
            {cardInfo.map((card) => (
              <div key={card._id}>
                <div className="two-column-form" >
                  <div className="form-group"/>
                  <div className="form-group">
                    <label>First Name<em> *</em></label>
                    <input id="firstName" type="text" defaultValue={card.firstName}
                      onChange={(e) => setFirstName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label>Last Name<em> *</em></label>
                    <input id="lastName" type="text" defaultValue={card.lastName}
                      onChange={(e) => setLastName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label>Birth Date</label>
                    <input id="birth" type="date" defaultValue={card.birth} max={today} onChange={(e) => setBirth(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Cell Phone<em> *</em></label>
                    <input id="cellPhone" type="text" defaultValue={card.cellPhone} onChange={(e) => setCellPhone(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label>Home Phone</label>
                    <input id="homePhone" type="text"
                      defaultValue={card.homePhone} onChange={(e) => setHomePhone(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>School Name</label>
                    <input id="schoolName" type="text" defaultValue={card.schoolName} onChange={(e) => setSchoolName(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>School Phone</label>
                    <input id="schoolPhone" type="text" defaultValue={card.schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Special Information</label>
                    <textarea id="addInfo" type="text" placeholder="Special needs, medical conditions, allergies, Important information" defaultValue={card.addInfo} onChange={(e) => setAddInfo(e.target.value)} />
                  </div>

                  <div className="form-group">
                    { isMobile ?
                    <div className="right-form">
                      <label id="upload-lb">Upload Image</label>
                      <ImageUploadWidget setFile={setImage} isMobile={isMobile} />
                    </div> : '' }
                  </div>

                  <div className="form-group">
                    <label>Password<em> *</em></label>
                    <input id="password-input" type={isHiden ? 'password' : 'text'} name="password" onChange={(e) => setPassword(e.target.value)} />
                    <i className={isToggleOn ? 'bi-eye' : 'bi bi-eye-slash'} id="togglePassword" defaultValue={card.password} onClick={handlePasswordClick}></i>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password<em> *</em></label>
                    <input type="password" name="confirmPassword" onChange={(e) => checkPasswordIsSame(e)} required />
                    <div className='password-confirm' id="password">
                      <span className="confirmSamePassword" id={isSamePassword}>{textIsSamePassword}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <button type="submit" className="submit-edit-btn" disabled={disableForm}>Edit My QR</button>
                  </div>
                </div>
                { isMobile ?
                <>
                  <div className='search-href' style={{padding: '1rem 0'}}>
                    <a style={{color: 'red', fontSize: '18px', marginRight: '4rem'}} onClick={()=> deleteCard(cardInfo)}>Delete Card</a>
                    <a style={{color: 'grey', fontSize: '18px'}} href={'/search/' + qrText}>Back to card info</a>
                  </div>
                </> :
                    '' }
              </div>
            ))}
          </form>

          { isMobile ? '' : <>
            <div className='right-form'>
              <h3>Upload Image</h3>
              <div>
                <ImageUploadWidget setFile={setImage} isMobile={isMobile} />
              </div>
              <div className='search-href' style={{marginTop: '6rem'}}>
                <div className="delete-card" onClick={()=> deleteCard(cardInfo)}>Delete Card</div>
                <a style={{color: 'grey', fontSize: '15px'}} href={'/search/' + qrText}>Back to card info</a>
              </div>
            </div>
          </>
          }
        </div>
      </div>
    </div>
  );
};

export default EditCard;
