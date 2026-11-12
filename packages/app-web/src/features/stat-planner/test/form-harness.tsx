import { FunctionComponent, ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { I18nextProvider } from 'react-i18next';

import i18n from '../../../i18n';
import { DEFAULTS, PlannerForm } from '../planner-form';

type FormHarnessProps = {
  form?: Partial<PlannerForm>;
  children: ReactNode;
};

const FormHarness: FunctionComponent<FormHarnessProps> = ({
  form,
  children,
}) => {
  const methods = useForm<PlannerForm>({
    defaultValues: { ...DEFAULTS, ...form },
  });

  return (
    <I18nextProvider i18n={i18n}>
      <FormProvider {...methods}>{children}</FormProvider>
    </I18nextProvider>
  );
};

export default FormHarness;
