registerSettingPage(function (props) {
   return (
       <Page>
           <Section
               title={<Text bold align="center">User setting</Text>}>
               <TextInput
                   label='User email'
                   settingsKey='email'
                   placeholder='Type your email'
                   action='Your ID is changed.'
                   onChange={value => console.log("ASDF")}/>
           </Section>
       </Page>
   )
});