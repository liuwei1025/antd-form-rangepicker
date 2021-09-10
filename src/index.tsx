import React, { useContext } from "react";
import { Button, DatePicker, Form } from "antd";
import { FormInstance, FormItemProps as AntdFormItemProps } from "antd/es/form";
import { concat, get } from "lodash";
import { NamePath } from "antd/es/form/interface";
import FieldContext from "rc-field-form/es/FieldContext";
import moment from "moment";
import ReactDOM from "react-dom";
import "antd/dist/antd.css";

export interface FormItemProps<Values = any> extends AntdFormItemProps<Values> {
  names?: NamePath[];
  format?: {
    name?: NamePath[];
    format?: (
      names: NamePath[],
      form: FormInstance<Values>
    ) => Pick<AntdFormItemProps<Values>, "getValueProps" | "getValueFromEvent">;
  };
}

function FormItem<Values = any>(props: FormItemProps<Values>) {
  const { names, ...rest } = props;
  const { prefixName } = useContext(FieldContext);
  const _names = names?.map((name) => {
    return prefixName ? concat(prefixName, name) : name;
  });
  const [start, end] = _names;
  return (
    <>
      <Form.Item
        noStyle
        shouldUpdate={(prev, next) => {
          const result = _names
            ?.map((name) => get(prev, name) !== get(next, name))
            .filter((x) => x);
          return (result?.length || 0) > 0;
        }}
      >
        {(form: FormInstance<Values>) => (
          <Form.Item
            getValueProps={(value) => {
              return {
                value: value && [
                  moment(Number(value)),
                  moment(Number(form.getFieldValue(_names[1])))
                ]
              };
            }}
            getValueFromEvent={(values) => {
              const [start, end] = values || [];
              form.setFields([
                {
                  name: _names[1],
                  value: end && end.valueOf()
                }
              ]);
              return start && start.valueOf();
            }}
            name={start}
            {...rest}
          />
        )}
      </Form.Item>
      <Form.Item name={end} noStyle />
    </>
  );
}

const Demo = () => {
  return (
    <Form
      onFinish={(v) => {
        console.log(v);
        console.log(moment(+v.start).format("YYYY-MM-DD"));
        console.log(moment(+v.end).format("YYYY-MM-DD"));
      }}
      initialValues={{
        end: "1631807999999",
        start: "1620611200000"
      }}
    >
      <FormItem names={["start", "end"]} label="range">
        <DatePicker.RangePicker />
      </FormItem>
      <Form.Item>
        <Button htmlType="submit">提交</Button>
      </Form.Item>
    </Form>
  );
};

ReactDOM.render(<Demo />, document.getElementById("container"));
