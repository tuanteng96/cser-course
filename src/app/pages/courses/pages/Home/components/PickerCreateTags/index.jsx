import React, { useEffect, useState } from "react";
import { FloatingPortal } from "@floating-ui/react";
import {
  Dialog,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  ChevronDownIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { Button } from "src/app/_ezs/partials/button";
import { Input, InputNumber, InputTextarea } from "src/app/_ezs/partials/forms";
import clsx from "clsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import ConfigAPI from "src/app/_ezs/api/config.api";
import { SpinnerComponent } from "src/app/_ezs/components/spinner";
import { toast } from "react-toastify";

const TagsSubs = ({ name, Title }) => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  return (
    <div className="pt-3 pl-8 pr-10">
      {fields &&
        fields.map((field, index) => (
          <div className="flex mb-2 last:mb-0" key={field.id}>
            <div className="flex-1">
              <Controller
                name={`${name}[${index}].label`}
                control={control}
                render={({ field: { ref, ...field }, fieldState }) => (
                  <Input
                    placeholder="Nhập tên tag"
                    value={field.value}
                    onChange={field.onChange}
                    errorMessageForce={fieldState?.invalid}
                    errorMessage={fieldState?.error?.message}
                  />
                )}
              />
            </div>
            <button
              className="bg-danger hover:bg-dangerhv text-white rounded cursor-pointer px-2 transition h-[44px] w-10 mx-1.5"
              onClick={() => remove(index)}
            >
              <TrashIcon className="w-6" />
            </button>
          </div>
        ))}
      <button
        className="bg-success hover:bg-successhv transition text-white text-sm px-2 py-1 rounded"
        type="button"
        onClick={() => append({ label: "" })}
      >
        Thêm tag {Title}
      </button>
    </div>
  );
};

function PickerCreateTags({ children }) {
  const [visible, setVisible] = useState(false);

  const onHide = () => setVisible(false);

  const methods = useForm({
    defaultValues: {
      Tags: [
        {
          defaultOpen: false,
          label: "",
          children: [
            {
              label: "",
            },
          ],
        },
      ],
    },
  });

  const { control, handleSubmit, reset } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "Tags",
  });

  const SettingTagsCourse = useQuery({
    queryKey: ["SettingTagsCourse"],
    queryFn: async () => {
      let { data } = await ConfigAPI.getName(`daotaotag`);
      let rs = [];
      if (data?.data && data?.data?.length > 0) {
        const result = JSON.parse(data?.data[0].Value);
        if (result) {
          rs = result;
        }
      }
      return rs;
    },
    initialData: [],
    enabled: visible,
  });

  useEffect(() => {
    if (SettingTagsCourse.data) {
      reset({ Tags: SettingTagsCourse.data });
    }
  }, [SettingTagsCourse.data]);

  const addMutation = useMutation({
    mutationFn: (data) => ConfigAPI.saveName(data),
  });

  const onSubmit = (values) => {
    let body = [...(values.Tags || [])];
    body = body
      .map((x) => ({
        ...x,
        defaultOpen: false,
        children: x.children ? x.children.filter((x) => x.label) : [],
      }))
      .filter((x) => x.label);
    addMutation.mutate(
      {
        body,
        name: "daotaotag",
      },
      {
        onSuccess: (data) => {
          toast.success("Cập nhập thành công.");
          onHide();
        },
      }
    );
  };

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false),
      })}
      <AnimatePresence>
        {visible && (
          <FloatingPortal>
            <LayoutGroup>
              <Dialog open={visible} onClose={onHide}>
                <m.div
                  className="fixed inset-0 bg-black/[.2] z-[1003]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                ></m.div>
                <FormProvider {...methods}>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="fixed inset-0 flex items-center justify-center z-[1003]"
                    autoComplete="off"
                  >
                    <m.div
                      className="absolute flex flex-col justify-center h-full py-10 max-w-[500px] w-full px-5 md:px-0"
                      initial={{ opacity: 0, top: "60%" }}
                      animate={{ opacity: 1, top: "auto" }}
                      exit={{ opacity: 0, top: "60%" }}
                    >
                      <Dialog.Panel
                        tabIndex={0}
                        className="flex flex-col w-full max-h-full bg-white rounded shadow-lg"
                      >
                        <Dialog.Title className="relative flex justify-between px-5 py-5 border-b border-light">
                          <div className="text-xl font-bold md:text-2xl">
                            Cài đặt Tags khóa học
                          </div>
                          <div
                            className="absolute flex items-center justify-center w-12 h-12 cursor-pointer right-2 top-2/4 -translate-y-2/4"
                            onClick={onHide}
                          >
                            <XMarkIcon className="w-8" />
                          </div>
                        </Dialog.Title>
                        <div
                          className={clsx(
                            "p-5 overflow-auto grow relative",
                            SettingTagsCourse.isLoading && "min-h-[50%]"
                          )}
                        >
                          <SpinnerComponent
                            loading={SettingTagsCourse.isLoading}
                          />
                          {SettingTagsCourse.isLoading && (
                            <div className="h-60" />
                          )}
                          {!fields ||
                            (fields.length === 0 && (
                              <div>
                                Bạn vui lòng chọn
                                <span
                                  className="bg-success text-white rounded mx-1.5 text-sm px-2 py-1 cursor-pointer"
                                  onClick={() =>
                                    append({
                                      defaultOpen: true,
                                      label: "",
                                      children: [
                                        {
                                          label: "",
                                        },
                                      ],
                                    })
                                  }
                                >
                                  Thêm nhóm Tags
                                </span>
                                bên dưới để thêm mới.
                              </div>
                            ))}
                          {fields &&
                            fields.map((field, index) => (
                              <div className="mb-3.5 last:mb-0" key={field.id}>
                                <Disclosure defaultOpen={field.defaultOpen}>
                                  {({ open }) => (
                                    <div>
                                      <div className="flex">
                                        <div className="flex-1">
                                          <Controller
                                            name={`Tags.${index}.label`}
                                            control={control}
                                            render={({
                                              field: { ref, ...field },
                                              fieldState,
                                            }) => (
                                              <Input
                                                placeholder="Nhập tên nhóm Tags"
                                                value={field.value}
                                                onChange={field.onChange}
                                                errorMessageForce={
                                                  fieldState?.invalid
                                                }
                                                errorMessage={
                                                  fieldState?.error?.message
                                                }
                                              />
                                            )}
                                          />
                                        </div>
                                        <button
                                          className="bg-danger hover:bg-dangerhv text-white rounded cursor-pointer px-2 transition h-[44px] w-10 mx-1.5"
                                          onClick={() => remove(index)}
                                        >
                                          <TrashIcon className="w-6" />
                                        </button>
                                        <DisclosureButton className="flex items-center justify-center w-10 bg-[#E4E6EF] rounded">
                                          <ChevronDownIcon
                                            className={clsx(
                                              "w-5",
                                              open && "rotate-180"
                                            )}
                                          />
                                        </DisclosureButton>
                                      </div>
                                      <DisclosurePanel>
                                        <TagsSubs
                                          Title={field.label}
                                          name={`Tags.${index}.children`}
                                        />
                                      </DisclosurePanel>
                                    </div>
                                  )}
                                </Disclosure>
                              </div>
                            ))}
                        </div>
                        <div className="flex justify-between p-5 border-t border-light">
                          <div>
                            <Button
                              type="button"
                              className="relative flex items-center h-12 px-5 ml-2 text-white transition rounded shadow-lg bg-success hover:bg-successhv focus:outline-none focus:shadow-none disabled:opacity-70"
                              onClick={() =>
                                append({
                                  defaultOpen: true,
                                  label: "",
                                  children: [
                                    {
                                      label: "",
                                    },
                                  ],
                                })
                              }
                            >
                              Thêm nhóm Tags
                            </Button>
                          </div>
                          <div className="flex">
                            <button
                              type="button"
                              className="relative flex items-center h-12 px-5 transition border rounded shadow-lg border-light hover:border-gray-800 focus:outline-none focus:shadow-none"
                              onClick={onHide}
                            >
                              Đóng
                            </button>
                            <Button
                              disabled={addMutation.isPending}
                              loading={addMutation.isPending}
                              type="submit"
                              className="relative flex items-center h-12 px-5 ml-2 text-white transition rounded shadow-lg bg-primary hover:bg-primaryhv focus:outline-none focus:shadow-none disabled:opacity-70"
                            >
                              Cập nhập
                            </Button>
                          </div>
                        </div>
                      </Dialog.Panel>
                    </m.div>
                  </form>
                </FormProvider>
              </Dialog>
            </LayoutGroup>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </>
  );
}

export default PickerCreateTags;
