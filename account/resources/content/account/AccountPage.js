import React, { useState, useContext } from 'react';
import {
  ActionGroup,
  Button,
  Form,
  FormGroup,
  TextInput,
  InputGroup,
  Grid,
  GridItem,
  ExpandableSection,
  ValidatedOptions,
  PageSection,
  PageSectionVariants,
  Text,
  TextVariants,
  TextContent,
} from '@patternfly/react-core';
import { AccountServiceContext } from './AccountServiceContext';
import { Msg } from './Msg';
import { ContentPage } from './ContentPage';
import { ContentAlert } from './ContentAlert';
import { LocaleSelector } from './LocaleSelectors';
import { KeycloakContext } from './KeycloakContext';
import { AIACommand } from './AIACommand';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';

const DEFAULT_STATE = {
  errors: {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
  },
  formFields: {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    attributes: {},
  },
};

export const AccountPage = (props, context) => {
  const {doPost} = useContext(AccountServiceContext);
  const [state, setState] = useState(DEFAULT_STATE);
  const {
    isRegistrationEmailAsUsername,
    isEditUserNameAllowed,
    isDeleteAccountAllowed,
    isUpdateEmailFeatureEnabled,
    isUpdateEmailActionEnabled
  } = useContext(KeycloakContext);
  const {formFields, errors} = state;

  const handleCancel = () => {
    fetchPersonalInfo();
  };

  const handleChange = (value, event) => {
    const target = event.currentTarget;
    const name = target.name;
    setState({
      errors: {...errors, [name]: target.validationMessage},
      formFields: {...formFields, [name]: value},
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const isValid = form.checkValidity();

    if (isValid) {
      const reqData = {...formFields};
      doPost('/', reqData).then(() => {
        ContentAlert.success('accountUpdatedMessage');

        if (locale !== formFields.attributes.locale[0]) {
          window.location.reload();
        }
      });
    } else {
      const formData = new FormData(form);
      const validationMessages = Array.from(formData.keys()).reduce((acc, key) => {
        acc[key] = form.elements[key].validationMessage;
        return acc;
      }, {});
      setState({
        errors: {...validationMessages},
        formFields: formFields,
      });
    }
  };

  const fetchPersonalInfo = () => {
    context.doGet("/").then(response => {
      setState(DEFAULT_STATE);
      const formFields = response.data;

      if (!formFields.attributes) {
        formFields.attributes = {
          locale: [locale]
        };
      } else if (!formFields.attributes.locale) {
        formFields.attributes.locale = [locale];
      }

      setState({...{
          formFields: formFields
        }
      });
    });
  }

  return (
      <ContentPage>
        <PageSection variant={PageSectionVariants.light}>
          <TextContent>
            <Text component={TextVariants.h1}>
              <Msg msgKey="accountTitle" />
            </Text>
            <Text component={TextVariants.p}>
              <Msg msgKey="accountDescription" />
            </Text>
          </TextContent>
        </PageSection>
        <PageSection>
          <Form isHorizontal onSubmit={handleSubmit}>
            {!isRegistrationEmailAsUsername && <FormGroup label={<Msg msgKey="username" />} isRequired fieldId="username" helperTextInvalid={state.errors.username} validated={ValidatedOptions.success}>
              <TextInput isRequired type="text" id="username" name="username" disabled={!isEditUserNameAllowed} value={state.formFields.username} onChange={handleChange} />
            </FormGroup>}
            <FormGroup label={<Msg msgKey="firstName" />} isRequired fieldId="firstName" helperTextInvalid={state.errors.firstName} validated={ValidatedOptions.success}>
              <TextInput isRequired type="text" id="firstName" name="firstName" value={state.formFields.firstName} onChange={handleChange} />
            </FormGroup>
            <FormGroup label={<Msg msgKey="lastName" />} isRequired fieldId="lastName" helperTextInvalid={state.errors.lastName} validated={ValidatedOptions.success}>
              <TextInput isRequired type="text" id="lastName" name="lastName" value={state.formFields.lastName} onChange={handleChange} />
            </FormGroup>
            {isEditUserNameAllowed && <FormGroup label={<Msg msgKey="email" />} isRequired fieldId="email" helperTextInvalid={state.errors.email} validated={ValidatedOptions.success}>
              <InputGroup>
                <TextInput isRequired type="email" id="email" name="email" disabled={!isUpdateEmailActionEnabled} value={state.formFields.email} onChange={handleChange} />
              </InputGroup>
            </FormGroup>}
            <FormGroup fieldId="locale">
              <LocaleSelector selectedLocale={locale} />
            </FormGroup>
            <FormGroup fieldId="actions">
              <ActionGroup>
                <Button type="submit" variant="primary">
                  <Msg msgKey="save" />
                </Button>
                <Button variant="secondary" onClick={handleCancel}>
                  <Msg msgKey="cancel" />
                </Button>
                {isDeleteAccountAllowed && <AIACommand id="delete-account" className="pf-c-button pf-m-danger" style={{marginLeft: "1rem"}}><Msg msgKey="deleteAccount" /></AIACommand>}
                {isUpdateEmailFeatureEnabled && isUpdateEmailActionEnabled && <ExternalLinkSquareAltIcon className="pf-c-button__icon" style={{marginLeft: "1rem"}} />}
              </ActionGroup>
            </FormGroup>
          </Form>
        </PageSection>
      </ContentPage>
  )

}
