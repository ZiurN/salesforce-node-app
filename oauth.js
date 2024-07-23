class OAuth2 {
  constructor() {
    this.ziurfreelance = {
      oauth2 : {
        loginUrl : 'https://login.salesforce.com',
        clientId : '3MVG9KsVczVNcM8zldYMMbz.6W8z48ZH765Tno.4QFuezjuX_EFBUbAEJt6V4N.Mdk0XaWfTyAFcmKzKc4PHr',
        clientSecret : '794B6798C62E766C1C192B8970B81B27F07D79F66D32D0368E3244D7DCEE3E31',
        redirectUri : 'https://login.salesforce.com/services/oauht2/callback'
      },
      username : 'jeferson@ziurfreelance.com',
      password : '@ZiuR11235qa9zUYViTDTOiqWrHjPgv6j8'
    }
    this.injuryAlliance = {
      oauth2 : {
        loginUrl : 'https://injuryalliance.my.salesforce.com/',
        clientId : '3MVG9KsVczVNcM8zldYMMbz.6W8z48ZH765Tno.4QFuezjuX_EFBUbAEJt6V4N.Mdk0XaWfTyAFcmKzKc4PHr',
        clientSecret : '794B6798C62E766C1C192B8970B81B27F07D79F66D32D0368E3244D7DCEE3E31',
        redirectUri : 'https://login.salesforce.com/services/oauth2/success'
      },
      username : 'jruiz@sfsmart.ai',
      password : '@ZiuR11235qV23iyywxUl9dGOblwt1o4wO1'
    }
    this.patDevSBX = {
      oauth2 : {
        loginUrl : 'https://aba--patdevsbx.sandbox.my.salesforce.com/',
        clientId : '3MVG9srSPoex34FUsebMFmjfzB3wTMoZlmhA2SzSWKHC4SDn1gO1Mwx1AujYXetxAU6cA4MvBwakZXgdsWi9d',
        clientSecret : '9CCAE870375559A7D509678934F0BA0F13F9E58651D7BF58709F373AAB6445B3',
        redirectUri : 'https://login.salesforce.com/services/oauth2/success'
      },
      username : 'avram@ablairlaw.com.patdevsbx',
      password : 'SiyaRam@69QFIqjEvD2AyrXRFFnBPVgfOJg'
    }
    this.ABAProd = {
      oauth2 : {
        loginUrl : 'https://avramblairandassociates.my.salesforce.com/',
        clientId : '3MVG9xOCXq4ID1uEfFlBe76plruVGl7EjKOIlpPzWhnLHWilHIF_1sFFDuFeOZfl53F7K04JRTjIDk.L9mM9f',
        clientSecret : '7E5A9D3E800A242483EF12A7683C0E3F9DF3BDCD34BA6F1D6317B10E0A4C000D',
        redirectUri : 'https://login.salesforce.com/services/oauth2/success'
      },
      username : 'autumn@ablairlaw.com',
      password : 'Suzanne201883Ralpc2ibiFZ1oqgX8nGBzv'
    }
	this.ABATesting = {
		oauth2 : {
		  loginUrl : 'https://avramblairandassociates--testing.sandbox.my.salesforce.com/',
		  clientId : '3MVG9KshNav2_Jdqol.L8ocSml_xRMW5_ZcFlXGd58UKukMBtSCgY38pH6GuBmWuYHPffyGubB06Deeq4tDhq',
		  clientSecret : 'D3148E76D7440769EDC44B4047F0423A78398BA7247CC7BB20920B5A2AE4022B',
		  redirectUri : 'https://login.salesforce.com/services/oauth2/success'
		},
		username : 'autumn@ablairlaw.com.testing',
		password : 'Suzanne201883Ralpc2ibiFZ1oqgX8nGBzv'
	  }
  }
}

export { OAuth2 }