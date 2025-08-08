import React from "react";
import { LoginFormData, loginSchema } from "../schemas/auth.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2Icon, LogIn, AlertCircle } from "lucide-react";
import { AuthCard } from "./auth-card";
import { AuthRedirect } from "./auth-redirect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordField } from "./password-field";
import { LoginFormFields } from "./user-field";
import { useLogin } from "../hooks/useAuth.hooks";

const AuthForm = () => {

  const { mutateAsync: login, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      user: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Limpiar errores previos
    clearErrors("root");
    
    try {
      await login(data);
    } catch (error: unknown) {
      // Extraer el mensaje del error para mostrarlo en el Alert
      let errorMessage = "Error desconocido al iniciar sesión";
      if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = (error as { message?: string }).message || errorMessage;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      setError("root", { 
        type: "manual",
        message: errorMessage 
      });
    }
  };

  return (
    <>
      <AuthRedirect redirectWhen="authenticated" useReturnUrl={true} />

      <AuthCard
        title="COTIZADOR"
        description=""
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Global form errors */}
          {errors.root && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {errors.root.message}
              </AlertDescription>
            </Alert>
          )}

          <LoginFormFields register={register} errors={errors} />

          <PasswordField
            id="password"
            label="Contraseña"
            placeholder="Tu contraseña"
            register={register("password")}
            error={errors.password?.message}
          />


          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isPending}>
            {isPending ? <Loader2Icon className="animate-spin" /> : <LogIn />}
            {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

      </AuthCard>
    </>
  )
 
};

export default AuthForm;
