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
  const { format, names, ...rest } = props;
  const { prefixName } = useContext(FieldContext);
  if (!format) {
    return <Form.Item {...rest} />;
  }

  const _names = names?.map((name) => {
    return prefixName ? concat(prefixName, name) : name;
  });

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
          <Form.Item {...format?.format?.(_names || [], form)} {...rest} />
        )}
      </Form.Item>
      {names?.map((name) => (
        <Form.Item key={concat(name).join("_")} name={name} noStyle />
      ))}
    </>
  );
}

export interface FormatProps<T> {
  getRangeMomentToTimestamp: (name: NamePath[], second?: boolean) => T;
}

export const format: FormatProps<FormItemProps["format"]> = {
  // [moment,moment] => { start_at:1619366400000,end_at:1622044799999 }
  getRangeMomentToTimestamp: (name, second) => ({
    name,
    format: (names, form) => {
      debugger;
      return {
        getValueProps: (value) => {
          return {
            value: value && [
              moment(Number(value)),
              moment(Number(form.getFieldValue(names[1])))
            ]
          };
        },
        getValueFromEvent: (values) => {
          const [start, end] = values || [];
          form.setFields([
            {
              name: names[1],
              value: end && end.valueOf()
            }
          ]);
          return start && start.valueOf();
        }
      };
    }
  })
};

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
      <FormItem
        name="start"
        names={["start", "end"]}
        label="range"
        format={format.getRangeMomentToTimestamp(["end"])}
      >
        <DatePicker.RangePicker />
      </FormItem>
      <FormItem>
        <Button htmlType="submit">提交</Button>
      </FormItem>
    </Form>
  );
};

ReactDOM.render(<Demo />, document.getElementById("container"));
